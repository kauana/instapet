import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
} from 'react-native';
import InputScrollView from 'react-native-input-scroll-view';

import { Button, Input, Image } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';
import colors from '../colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const TITLE_IMAGE = require('../../assets/dog.png');
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
    width: 250,
    height: 400,
  },
  loginTitle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'regular',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerView: {
    marginTop: 20,
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontFamily: 'light',
    color: colors.red(1),
    textAlign: 'center',
    fontSize: 12,
  },
});

class LoginScreen extends Component {
  static navigationOptions = { header: null }

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      errorMessage: null,
    };
  }

  handleLogin = () => {
    const { email, password } = this.state;
    const { navigation } = this.props;

    firebase.auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        navigation.goBack();
      }).catch((error) => {
        this.setState({ errorMessage: error.message });
      });
  }

  render() {
    const { email, password, errorMessage } = this.state;
    const { navigation: { navigate } } = this.props;

    return (
      <View style={styles.container}>
        <InputScrollView keyboardOffset={80}>
          <ImageBackground source={BG_IMAGE} style={styles.bgImage}>
            <View style={styles.loginView}>
              <View style={styles.loginTitle}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.titleText}>InstaPet</Text>
                  <Image source={TITLE_IMAGE} />
                </View>
              </View>
              <View style={styles.loginForm}>
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
                    this.passwordInput.focus();
                  }}
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
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  ref={(input) => { this.passwordInput = input; }}
                />
              </View>
              <Button
                title="Log In"
                activeOpacity={1}
                underlayColor="transparent"
                loadingProps={{ size: 'small', color: 'white' }}
                buttonStyle={{
                  height: 50,
                  width: 250,
                  backgroundColor: colors.red(1),
                  borderWidth: 0,
                }}
                containerStyle={{ marginVertical: 10 }}
                titleStyle={{ fontFamily: 'bold', color: 'white' }}
                onPress={this.handleLogin}
              />
              <View style={styles.footerView}>
                <Text style={{ fontFamily: 'regular', color: 'black' }}>No account yet?</Text>
                <Button
                  title="Sign Up"
                  clear
                  activeOpacity={0.5}
                  titleStyle={{ fontFamily: 'bold', color: 'white', fontSize: 15 }}
                  containerStyle={{ marginTop: -10 }}
                  buttonStyle={{ backgroundColor: 'transparent' }}
                  onPress={() => navigate('SignUp')}
                />

                {errorMessage
                  && <Text style={[styles.error, { fontFamily: 'bold' }]}>{errorMessage}</Text>
                }
              </View>
            </View>
          </ImageBackground>
        </InputScrollView>
      </View>
    );
  }
}

export default LoginScreen;

// Source Tutorials Used
// https://github.com/Monte9/react-native-elements-app
