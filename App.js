import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import firebase from './firestore';

export default class App extends Component {
  constructor() {
    super();
    this.ref = firebase.firestore().collection('people');
    this.unsubscribe = null;
    this.state = {
      isLoading: true,
      people: [],
    }
  }

  onCollectionUpdate = (snapshot) => {
    const people = [];
    snapshot.forEach((doc) => {
      const { name } = doc.data();
      people.push({
        key: doc.id,
        name,
      });
    });

    this.setState({
      people,
      isLoading: false,
    });
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  render() {
    if (this.state.isLoading) {
      <View style={styles.container}>
        <Text style={styles.titleText}>Loading...</Text>
      </View>
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.people}
          renderItem={ ({ item }) => <Text style={[styles.titleText, styles.greeting]}>Hello {item.name} </Text>}
        />
      </View>
    );
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    Login: LoginScreen,
    Register: RegisterScreen,
  },
  {
    initialRouteName: 'Home',
  }
);


const AppContainer = createAppContainer(RootStack);
type Props = {};
export default class App extends Component<Props> {
  render() {
    return <AppContainer />;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C3D2FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50
  },
  titleText: {
    fontSize: 28,
    textAlign: 'center',
  },
  greeting: {
    color: '#fff'
  }
});
