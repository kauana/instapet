import React, { Component } from 'react';
import { View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';
import { Button, Input, Image } from 'react-native-elements';
import colors from '../colors';
import {ImagePicker} from 'expo';
import SettingsList from 'react-native-settings-list';


class CreatePostScreen extends Component {
  static navigationOptions = () => ({
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name="camera"
        size={24}
        color={tintColor}
      />
    ),
  })
 

handleUploadPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync();

    if (!result.cancelled) {
      this.uploadImage(result.uri, "test-image")
        .then(() => {
         console.log("success");
        })
        .catch((error) => {
          console.log(error);
        });
    }
}

 handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled){
        this.uploadImage(result.uri);
    }
} 


uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    var ref = firebase.storage().ref.child("/images" + imageName);
    return ref.put(blob);
}

  render() {
    const db = firebase.firestore();

    return (
      <View style={{
        flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
      }}
      >   

         <Button
                title="Upload Photo"
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
               onPress={this.handleUploadPhoto}
              />

         <Button
                title="Take Photo"
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
                onPress={this.handleTakePhoto}
              /> 



      </View>
    );
  }
}

export default CreatePostScreen;// JavaScript source code
