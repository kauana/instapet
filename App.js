import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
} from 'react-native';

import { createStackNavigator, createAppContainer } from "react-navigation";
import firebase from './firestore';
import { Button, Input, Image } from 'react-native-elements';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const TITLE_IMAGE = require('./assets/dog.png');
const BG_IMAGE = require('./assets/home-bg.jpg');

class HomeScreen extends Component {
  static navigationOptions = { header: null }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={BG_IMAGE} style={styles.bgImage}>
          <View style={styles.loginView}>
            <View style={styles.loginTitle}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.titleText}>InstaPet</Text>
                <Image source={TITLE_IMAGE} />
              </View>
            </View>
            <View style={styles.loginInput}>
              <Input
                placeholder='Username'
                placeholderTextColor='white'
                leftIcon={
                  <IconMC
                    name="account"
                    color="rgba(200, 200, 230, 1)"
                    size={25}
                  />
                }
                containerStyle={{ marginVertical: 10 }}
                inputStyle={{ marginLeft: 10, color: 'white' }}
                keyboardAppearance='light'
                returnKeyType='next'
              />
              <Input
                placeholder='Password'
                placeholderTextColor='white'
                leftIcon={
                  <IconFA
                    name="lock"
                    color="rgba(200, 200, 230, 1)"
                    size={25}
                  />
                }
                secureTextEntry={true}
                containerStyle={{ marginVertical: 10 }}
                inputStyle={{ marginLeft: 10, color: 'white' }}
                keyboardAppearance='light'
                returnKeyType='done'
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='default'
              />
            </View>
            <Button
              title="LOG IN"
              activeOpacity={1}
              underlayColor="transparent"
              loadingProps={{ size: 'small', color: 'white' }}
              buttonStyle={{
                height: 50,
                width: 250,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: 'white',
                borderRadius: 30,
              }}
              containerStyle={{ marginVertical: 10 }}
              titleStyle={{ fontWeight: 'bold', color: 'white' }}
            />
            <View style={styles.footerView}>
              <Text style={{ color: 'black' }}>No account yet?</Text>
              <Button
                title="Sign Up"
                clear
                activeOpacity={0.5}
                titleStyle={{ color: 'white', fontSize: 15 }}
                containerStyle={{ marginTop: -10 }}
                buttonStyle={{ backgroundColor: 'transparent' }}
              />
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

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
    // fontFamily: 'bold',
  },
  loginInput: {
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
});


const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen
  }
});

export default createAppContainer(AppNavigator);

