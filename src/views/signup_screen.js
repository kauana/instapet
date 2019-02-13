import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
} from 'react-native';
import InputScrollView from 'react-native-input-scroll-view';

import { Button, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';
import colors from '../colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const BG_IMAGE = require('../../assets/home-bg.jpg');

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
  loginView: {
    backgroundColor: 'transparent',
    width: 300,
    height: SCREEN_HEIGHT,
  },
  loginTitle: {
    marginTop: 100,
  },
  titleText: {
    fontFamily: 'regular',
    color: 'white',
    textAlign: 'center',
  },
  loginInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 0,
    padding: 3,
    borderRadius: 25,
  },
  formText: {
    marginLeft: 10,
    fontFamily: 'light',
    color: 'white',
    fontSize: 14,
  },
  loginForm: {
    flex: 1,
    alignItems: 'center',
    marginTop: 25,
  },
  error: {
    fontFamily: 'regular',
    color: colors.red(1),
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textAlign: 'center',
    fontSize: 12,
  },
});

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(email);
};

class SignUpScreen extends Component {
  static navigationOptions = {
    title: 'InstaPet',
    headerTransparent: true,
    headerTintColor: colors.red(1),
    headerTitleStyle: {
      color: 'white',
      fontFamily: 'regular',
    },
  }

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      usernameValid: true,

      email: '',
      emailValid: true,

      password: '',
      passwordValid: true,

      passwordConfirmation: '',
      passwordConfirmationValid: true,

      errorMessage: null,
    };
  }

  handleSignUp = () => {
    if (!this.validateFields()) {
      return;
    }

    const db = firebase.firestore();
    const { username, email, password } = this.state;
    const usersRef = db.collection('users');
    const { navigation } = this.props;

    usersRef.where('username', '==', username).get()
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          this.setState({ errorMessage: 'A user with this username already exists.' });
          return;
        }

        firebase.auth()
          .createUserWithEmailAndPassword(email, password)
          .then(({ user }) => {
            usersRef.doc(user.uid).set({
              username,
              email,
            }).then(() => {
              navigation.navigate('Main');
            }).catch((error) => {
              this.setState({ errorMessage: error.message });
            });
          }).catch(error => this.setState({ errorMessage: error.message }));
      });
  }

  validateUsername() {
    const { username } = this.state;

    const valid = username.length > 0;
    this.setState({ usernameValid: valid });

    if (!valid) {
      this.usernameInput.shake();
    }

    return valid;
  }

  validateEmail() {
    const { email } = this.state;

    const valid = validateEmail(email);
    this.setState({ emailValid: valid });

    if (!valid) {
      this.emailInput.shake();
    }

    return valid;
  }

  validatePassword() {
    const { password, passwordConfirmation } = this.state;

    const valid = password.length > 0;
    this.setState({ passwordValid: valid });

    if (!valid) {
      this.passwordInput.shake();
      return false;
    }

    const validConfirmation = password === passwordConfirmation;
    this.setState({ passwordConfirmationValid: validConfirmation });

    if (!validConfirmation) {
      this.passwordConfirmationInput.shake();
    }

    return validConfirmation;
  }

  validateFields() {
    return this.validateUsername()
      && this.validateEmail()
    && this.validatePassword();
  }

  render() {
    const {
      email, emailValid,
      username, usernameValid,
      password, passwordValid,
      passwordConfirmation, passwordConfirmationValid,
      errorMessage,
    } = this.state;

    return (
      <View style={styles.container}>
        <InputScrollView keyboardOffset={80}>
          <ImageBackground source={BG_IMAGE} style={styles.bgImage}>
            <View style={styles.loginView}>
              <View style={styles.loginTitle}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Text style={styles.titleText}>
                    Ready to show the world your awesome companion?
                  </Text>
                  <Text style={styles.titleText}>Register below.</Text>
                </View>
              </View>
              <View style={styles.loginForm}>
                <Input
                  placeholder="Username"
                  placeholderTextColor="white"
                  leftIcon={(
                    <Icon
                      name="account"
                      color={colors.green2(0.5)}
                      size={25}
                    />
                  )}
                  onChangeText={value => this.setState({ username: value })}
                  value={username}
                  containerStyle={{ marginVertical: 10 }}
                  inputContainerStyle={styles.loginInput}
                  inputStyle={styles.formText}
                  keyboardAppearance="light"
                  returnKeyType="next"
                  ref={(input) => { this.usernameInput = input; }}
                  onSubmitEditing={() => {
                    this.validateUsername();
                    this.emailInput.focus();
                  }}
                  errorStyle={styles.error}
                  errorMessage={
                    usernameValid ? null : 'Please enter a valid username.'
                  }
                />
                <Input
                  placeholder="Email"
                  placeholderTextColor="white"
                  leftIcon={(
                    <Icon
                      name="email"
                      color={colors.green2(0.5)}
                      size={25}
                    />
                  )}
                  onChangeText={value => this.setState({ email: value })}
                  value={email}
                  containerStyle={{ marginVertical: 10 }}
                  inputContainerStyle={styles.loginInput}
                  autoFocus={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputStyle={styles.formText}
                  keyboardType="email-address"
                  keyboardAppearance="light"
                  returnKeyType="next"
                  ref={(input) => { this.emailInput = input; }}
                  onSubmitEditing={() => {
                    this.validateEmail();
                    this.passwordInput.focus();
                  }}
                  errorStyle={styles.error}
                  errorMessage={
                    emailValid ? null : 'Please enter a valid email address.'
                  }
                />
                <Input
                  placeholder="Password"
                  placeholderTextColor="white"
                  leftIcon={(
                    <Icon
                      name="lock"
                      color={colors.green2(0.5)}
                      size={25}
                    />
                  )}
                  onChangeText={value => this.setState({ password: value })}
                  value={password}
                  secureTextEntry
                  inputContainerStyle={styles.loginInput}
                  containerStyle={{ marginVertical: 10 }}
                  inputStyle={styles.formText}
                  keyboardAppearance="light"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  returnKeyType="next"
                  ref={(input) => { this.passwordInput = input; }}
                  onSubmitEditing={() => {
                    this.passwordConfirmationInput.focus();
                  }}
                  errorStyle={styles.error}
                  errorMessage={
                    passwordValid ? null : 'Please enter a valid password.'
                  }
                />
                <Input
                  placeholder="Confirm Password"
                  placeholderTextColor="white"
                  leftIcon={(
                    <Icon
                      name="lock"
                      color={colors.green2(0.5)}
                      size={25}
                    />
                  )}
                  onChangeText={value => this.setState({ passwordConfirmation: value })}
                  value={passwordConfirmation}
                  secureTextEntry
                  inputContainerStyle={styles.loginInput}
                  containerStyle={{ marginVertical: 10 }}
                  inputStyle={styles.formText}
                  keyboardAppearance="light"
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  ref={(input) => { this.passwordConfirmationInput = input; }}
                  errorStyle={styles.error}
                  errorMessage={
                    passwordConfirmationValid ? null : 'Passwords do not match.'
                  }
                />

                {errorMessage
                  && <Text style={[styles.error, { fontFamily: 'bold' }]}>{errorMessage}</Text>
                }
              </View>

              <Button
                title="Register"
                activeOpacity={1}
                underlayColor="transparent"
                loadingProps={{ size: 'small', color: 'white' }}
                buttonStyle={{
                  height: 50,
                  width: 300,
                  backgroundColor: colors.red(1),
                  borderWidth: 0,
                }}
                containerStyle={{ marginVertical: 70 }}
                titleStyle={{ fontFamily: 'bold', color: 'white' }}
                onPress={this.handleSignUp}
              />
            </View>
          </ImageBackground>
        </InputScrollView>
      </View>
    );
  }
}

export default SignUpScreen;
