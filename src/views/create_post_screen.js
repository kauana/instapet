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

const db = firebase.firestore();

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
    this.unsubscribeFollowed = null;
    const { navigation } = this.props;
    this.userID = navigation.getParam('userID', 'NO-ID');
    this.writeRef = db.collection('posts');

    this.state = {
      description: '',
      imageURL: 'https://bigriverequipment.com/wp-content/uploads/2017/10/no-photo-available.png',
      hasCameraPermission: false,
      uploading: false,
      followed: [],
    };
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    this.setState({ hasCameraPermission: status === 'granted' });

    this.unsubscribeFollowed = db.collection('followed').doc(this.userID).onSnapshot(this.onUpdateFollowed);
  }

  componentWillUnmount() {
    this.unsubscribeFollowed();
  }

  // get a list of users following this user so we can show them this post
  onUpdateFollowed = (doc) => {
    if (!doc.exists) {
      db.collection('followed').doc(this.userID).set({});
      return;
    }

    const userIDs = Object.keys(doc.data());
    this.setState({ followerIDs: userIDs });
  }

  createPost = () => {
    const user = firebase.auth().currentUser;
    const { imageURL, description, followerIDs } = this.state;

    db.collection('posts').add({
      imageURL,
      description,
      followerIDs,
      likeCount: 0,
      commentedByUsers: [],
      likedByUsers: [],
      userID: user.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      this.setState({
        description: '',
        imageURL: 'https://bigriverequipment.com/wp-content/uploads/2017/10/no-photo-available.png',
      });
    });
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
      hasCameraPermission, uploading, imageURL, description,
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
              keyboarsAppearance="light"
              keyboardType="default"
              returnKeyType="done"
              blurOnSubmit
              autoFocus
              value={description}
              onChangeText={text => this.setState({ description: text })}
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
              onPress={this.createPost}
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
// Source: https://blog.expo.io/instagram-clone-using-firebase-react-native-expo-cc32f61c7bba?gi=9d6b2103a48f
