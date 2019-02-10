import { createStackNavigator, createAppContainer } from 'react-navigation';
import firebase from './firestore';
import LoginScreen from './src/views/login_screen';
import SignUpScreen from './src/views/signup_screen';

const AppNavigator = createStackNavigator({
  Home: { screen: LoginScreen },
  SignUp: { screen: SignUpScreen },
});

export default createAppContainer(AppNavigator);
