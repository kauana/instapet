import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-elements';
import SettingsList from 'react-native-settings-list';
import { ImagePicker, Permissions } from 'expo';
import colors from '../colors';
import firebase from '../../firestore';


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
      imagePath: '',
      imageURL: '',
      hasCameraPermission: false,
    };
  }



  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    this.setState({ hasCameraPermission: status === 'granted' });
  }


  handleUploadPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync();
    try{
        if (!result.cancelled) {
            this.uploadImage(result.uri, 'test-image')
                    .then(() => {
                      console.log('success');
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                    this.getURL(result.uri);
          }

       } catch(e){ console.log(e);}

  }


  handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      this.uploadImage(result.uri)
        .then(() => {
          console.log('success');
        })
        .catch((error) => {
          console.log('error');
        });
    }
  }


  uploadImage = async (uri, imagename) => {

        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
              resolve(xhr.response);
            };
            xhr.onerror = function(e) {
              console.log(e);
              reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null); })


  //      const response = await fetch(uri);
  //      const blob = this._urlToBlob(response);

        imagename = blob._data.blobId;

        const ref = firebase.storage().ref().child('images/' + imagename);

        return ref.put(blob);
//        return imagename;

  }

getURL = (uri, imagename) => {

    const ref = firebase.storage().ref().child('images/' + imagename);
    let url = ref.getDownloadUrl();
    console.log('this is your url ' + url);
    this.setState({imageURL: uri });
    return ref.getDownloadURL;
}

  postPhoto = () => {
    const {
      description, hashtag,
    } = this.state;

    this.write_ref.add({
      description,
      likes: false,
      image_url: this.state.imageURL,
//      image_url: this.state.imagePath.data,
      post_userID: this.userID,
      post_time_stamp: firebase.firestore.FieldValue.serverTimestamp(),
      hashtag,
    });
  }


  render() {
    const {
      image_url, description, hashtag, hasCameraPermission,
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

            {
            hasCameraPermission
              ? (
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
              )
              : null
          }

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


// urlToBlob function from: https://github.com/expo/firebase-storage-upload-example/issues/14
// https://github.com/expo/firebase-storage-upload-example/blob/master/App.js