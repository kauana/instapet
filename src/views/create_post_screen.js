import React, { Component } from 'react';
import uuid from 'react-native-uuid';
import {
  Image, View, StyleSheet, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Text, Button,
} from 'react-native-elements';
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
    flexDirection: 'row',
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
      imageURL: 'https://bigriverequipment.com/wp-content/uploads/2017/10/no-photo-available.png',
      hasCameraPermission: false,
      uploading: false,
    };
  }


  addThisPost = () => {
    let appUser = firebase.auth().currentUser.uid;

    function add_random_hashtags() {
      var hash_tag_array = ['cat', 'dog', 'rabbit', 'guinea pig', 'bird'];
      var random_int = Math.floor(Math.random() * hash_tag_array.length);
      var random_hashtag = [hash_tag_array[random_int]];

      return random_hashtag
    }
    function add_random_comments(post_userID) {
      random_comment = []
      if (post_userID == '8tIDp1pDSnQnq3tsgNwgD1SR3ul1') {
        random_comment.push({
          "ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3": 'comment' + Math.floor(Math.random() * 10)
        });
        random_comment.push({
          'iDJKuWxNYBhz0eUzzfpIyQjD7GE2': 'comment' + Math.floor(Math.random() * 10)
        });

      } else if (post_userID == 'ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3') {
        random_comment.push({
          "8tIDp1pDSnQnq3tsgNwgD1SR3ul1": 'comment' + Math.floor(Math.random() * 10)
        });
      } else {
        random_comment = [];
      }
      return random_comment
    }

    function add_Followers(post_userID) {
      if (post_userID == '8tIDp1pDSnQnq3tsgNwgD1SR3ul1') {
        followers_ID = ['ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3', 'iDJKuWxNYBhz0eUzzfpIyQjD7GE2']
      } else if (post_userID == 'ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3') {
        followers_ID = ['iDJKuWxNYBhz0eUzzfpIyQjD7GE2']
      } else {
        followers_ID = ['iDJKuWxNYBhz0eUzzfpIyQjD7GE2']
      }
      followers_ID = ['8tIDp1pDSnQnq3tsgNwgD1SR3ul1', 'M1FmnyjTLFgIsv4t3bdMz0UXO7s2', 
      'RY8ZaZSMcUad6S05saGyKiKc7pT2', 'VAjb1wSdJ6VahRrXSKL723nFaRc2',
      'ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3', 'iDJKuWxNYBhz0eUzzfpIyQjD7GE2','ncZ9X1qYG7PxwBW4eI9Zps8Qt3O2',
      'oXvTKGNhvITos3fXO15QfsCvMgE3', 'rVzvzPzevqTv5YyrLdeAAqHkcaf1']
      return followers_ID
    }

    //post_time_stamp_string: Date().toLocaleString().substring(15, 25),
    this.write_ref.add({
      description: this.state.description,
      likes: false,
      image_url: this.state.imageURL,
      post_userID: appUser,
      post_time_stamp: firebase.firestore.FieldValue.serverTimestamp(),
      followers_ID: add_Followers(random_author),
      hashtag: add_random_hashtags(),
      commented_by_user: add_random_comments(random_author),
      likesCount: 0,
      post_time_stamp_string: Date().toLocaleString().substring(0, 4) + Date().toLocaleString().substring(15, 25),
    });
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  handleUploadPhoto = async () => {
    this.setState({ uploading: true });
    const result = await ImagePicker.launchImageLibraryAsync();
    try {
      if (!result.cancelled) {
        this.uploadImage(result.uri);
      }
    } catch (e) { console.log(e); }
  }

  handleTakePhoto = async () => {
    this.setState({ uploading: true });
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      this.uploadImage(result.uri);
    }
  }

  uploadImage = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      };

      xhr.onerror = (err) => {
        console.log(err);
        reject(new TypeError('Network request failed'));
      };

      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const ref = firebase
      .storage()
      .ref()
      .child(uuid.v4());
    const snapshot = await ref.put(blob);

    // We're done with the blob, close and release it
    blob.close();

    const imageURL = await snapshot.ref.getDownloadURL();

    this.setState({ imageURL, uploading: false });
  }

  render() {
    const {
      imageURL, description, hasCameraPermission, uploading,
    } = this.state;

    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flex: 1, marginTop: 0 }}>
          <Text
            style={{
              marginTop: 10,
              marginLeft: 10,
              paddingBottom: 5,
              borderBottomWidth: 1,
              borderBottomColor: colors.grey(0.1),
              color: colors.grey(1),
            }}
          >
            CREATE POST
          </Text>

          <View style={{ padding: 10, flexDirection: 'row' }}>
            <Image
              source={{ uri: imageURL }}
              style={{ resizeMode: 'contain', aspectRatio: 1, width: 72 }}
            />
            <TextInput
              multiline
              style={{ flex: 1, paddingHorizontal: 16 }}
              placeholder="Enter description here..."
              onChangeText={(text) => {
                this.setState({ description: text });
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title=" Upload Photo"
              activeOpacity={1}
              underlayColor="transparent"
              loadingProps={{ size: 'small', color: 'white' }}
              loading={uploading}
              buttonStyle={{
                height: 50,
                width: 180,
                backgroundColor: colors.red(1),
                borderWidth: 0,
                marginRight: 10,
              }}
              icon={(
                <Icon
                  name="cloud-upload"
                  size={24}
                  color="white"
                />
              )}
              containerStyle={{ marginVertical: 10 }}
              titleStyle={{ fontFamily: 'regular', color: 'white' }}
              onPress={this.handleUploadPhoto}
            />

            {
            hasCameraPermission
              ? (
                <Button
                  title=" Take Photo"
                  activeOpacity={1}
                  underlayColor="transparent"
                  loadingProps={{ size: 'small', color: 'white' }}
                  loading={uploading}
                  buttonStyle={{
                    height: 50,
                    width: 180,
                    backgroundColor: colors.red(1),
                    borderWidth: 0,
                  }}
                  icon={(
                    <Icon
                      name="camera-iris"
                      size={24}
                      color="white"
                    />
                  )}
                  titleStyle={{ fontFamily: 'regular', color: 'white' }}
                  onPress={this.handleTakePhoto}
                />
              )
              : null
          }

          </View>

          <View style={styles.buttonContainer}>
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
              onPress={() => this.addThisPost()}
              //onPress={this.postPhoto}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default CreatePostScreen;

// urlToBlob function from: https://github.com/expo/firebase-storage-upload-example/issues/14
// https://github.com/expo/firebase-storage-upload-example/blob/master/App.js
