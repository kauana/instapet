import React, { Component } from 'react';
import { View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';
import { Button, Input, Image } from 'react-native-elements';
import colors from '../colors';
import {ImagePicker} from 'expo';
import SettingsList from 'react-native-settings-list';


const styles = StyleSheet.create({
  icon: {
    marginLeft: 15,
    marginRight: 10,
    alignSelf: 'center',
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


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
 
 constructor(props) {
    super(props);
    this.unsubscribe = null;
    const { navigation } = this.props;
    this.userID = navigation.getParam('userID', 'NO-ID');
    this.write_ref = firebase.firestore().collection('posts');

    this.state = {
      description: '',
      hashtag: '',
      imagePath:{},
    };
  }


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
        this.uploadImage(result.uri, "test-image")
        .then(() => {
         console.log("success");
        })
        .catch((error) => {
          console.log(error);
        });
    }
} 


uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    let source = response;
    this.setState({
        imagePath: source,
    });

//    var ref = firebase.storage().ref.child("/images" + imageName);
//    return ref.put(blob);
}

postPhoto = () => {
    const {
      description, hashtag, imagePath,
    } = this.state;

    this.write_ref.add({
         description: this.state.description,
         likes: false,
       //  image_url: this.state.imagePath.data,
         post_userID: this.userID,
         post_time_stamp: firebase.firestore.FieldValue.serverTimestamp(),
         hashtag: this.state.hashtag,
       });
}


  render() {
    const db = firebase.firestore();
    const {
          image_url, description, hashtag,
        } = this.state;
   
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flex: 1, marginTop: 0 }}>
            <SettingsList borderColor={colors.grey(0.2)} defaultItemSize={50}>
            <SettingsList.Header headerText="CREATE POST" headerStyle={{ color: colors.grey(1), marginTop: 50 }} />
          
                <SettingsList.Item
                    id="description"
                    title="caption"
                    isEditable
                    hasNavArrow={false}
                    value={description}
                    onTextChange={text => this.setState({ description: text })}
                    placeholder="About..."
                    icon={(
                    <Icon
                      name="clipboard-text"
                      size={24}
                      color={colors.red(1)}
                      style={styles.icon}
                    />
                  )}
                />
                <SettingsList.Item
                    id="hashtag"
                    title="hashtag"
                    isEditable
                    hasNavArrow={false}
                    value={hashtag}
                    onTextChange={text => this.setState({ hashtag: text })}
                    placeholder="#"
                    icon={(
                    <Icon
                      name="pound"
                      size={24}
                      color={colors.red(1)}
                      style={styles.icon}
                    />
                  )}
                />
            </SettingsList>
            <View style={styles.buttonContainer}>
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

             <Button
                title="Post"
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
                onPress={this.postPhoto}
              /> 

          </View>
        </View>
      </View>
    );
  }
}

export default CreatePostScreen;// JavaScript source code
