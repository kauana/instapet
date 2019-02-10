import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from '../../firestore';

class FeedScreen extends Component {
  static navigationOptions = {
    title: 'InstaPet',
    headerLeft: null,
    headerTransparent: true,
    headerTintColor: 'rgba(178, 91, 110, 0.5)',
    headerTitleStyle: {
      color: 'white',
    },
  }

  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      } else {
        navigation.navigate('Login');
      }
    });
  }

  render() {
    const { user } = this.state;
    return (
      <View style={{
        flex: 1, backgroundColor: 'green', justifyContent: 'center', alignItems: 'center',
      }}
      >
        <Text>{user && user.email}</Text>
      </View>
    );
  }
}

export default FeedScreen;
