import React, { Component } from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { Text, YellowBox } from 'react-native';
import { Font } from 'expo';
import _ from 'lodash';

import LaunchScreen from './src/views/launch_screen';
import LoginScreen from './src/views/login_screen';
import SignUpScreen from './src/views/signup_screen';
import SettingsScreen from './src/views/settings_screen';
import TabNavigator from './src/views/tab_navigator';

// Silences warning due to firebase using long-timers:
//   https://github.com/facebook/react-native/issues/12981
//   https://stackoverflow.com/questions/27732209/turning-off-eslint-rule-for-a-specific-line
YellowBox.ignoreWarnings(['Setting a timer']);
const originalConsole = _.clone(console);
console.warn = (message) => {
  if (message.indexOf('Setting a timer') <= -1) {
    originalConsole.warn(message);
  }
};

const AppNavigator = createStackNavigator({
  Home: { screen: LaunchScreen },
  SignUp: { screen: SignUpScreen },
  Login: { screen: LoginScreen },
  Main: { screen: TabNavigator },
  Settings: { screen: SettingsScreen },
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
