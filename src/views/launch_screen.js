import React, { Component } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import firebase from '../../firestore';
import colors from '../colors';

const BG_IMAGE = require('../../assets/launch-bg.jpg');

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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
      <View style={styles.container}>
        <ImageBackground source={BG_IMAGE} style={styles.bgImage}>
          <ActivityIndicator size={64} color={colors.red(1)} />
        </ImageBackground>
      </View>
    );
  }
}

export default LaunchScreen;
