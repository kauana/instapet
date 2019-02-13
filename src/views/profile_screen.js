import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';

class ProfileScreen extends Component {
  static navigationOptions = () => ({
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name="account-circle"
        size={24}
        color={tintColor}
      />
    ),
  })

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
        flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
      }}
      >
        <Text>{user && user.email}</Text>
        <Text>hello</Text>
      </View>
    );
  }
}

export default ProfileScreen;
