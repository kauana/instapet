import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from '../../firestore';

class LaunchScreen extends Component {
  static navigationOptions = { header: null }

  componentDidMount() {
    const { navigation } = this.props;

    firebase.auth().onAuthStateChanged((user) => {
      navigation.navigate(user ? 'Main' : 'Login');
    });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'yellow' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
}

export default LaunchScreen;
