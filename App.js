import React, { Component } from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { Text } from 'react-native';
import { Font } from 'expo';

import LaunchScreen from './src/views/launch_screen';
import LoginScreen from './src/views/login_screen';
import SignUpScreen from './src/views/signup_screen';
import SettingsScreen from './src/views/settings_screen';
import FeedScreen from './src/views/feed_screen';

const AppNavigator = createStackNavigator({
  Home: { screen: LaunchScreen },
  SignUp: { screen: SignUpScreen },
  Login: { screen: LoginScreen },
  Settings: { screen: SettingsScreen },
  Main: { screen: FeedScreen },
}, {
  headerLayoutPreset: 'center',
});

const AppContainer = createAppContainer(AppNavigator);

const regularFont = require('./assets/fonts/Montserrat-Regular.ttf');
const lightFont = require('./assets/fonts/Montserrat-Light.ttf');
const boldFont = require('./assets/fonts/Montserrat-Bold.ttf');

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fontLoaded: false,
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      regular: regularFont,
      light: lightFont,
      bold: boldFont,
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    const { fontLoaded } = this.state;

    if (fontLoaded) {
      return <AppContainer />;
    }

    return <Text>Loading...</Text>;
  }
}
