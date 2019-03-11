import React, { Component } from 'react';
import {
  StyleSheet, View, Image,
} from 'react-native';
import uuid from 'react-native-uuid';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsList from 'react-native-settings-list';
import { ImagePicker, Permissions } from 'expo';
import UserPresenter from '../presenters/user_presenter';
import firebase from '../../firestore';
import colors from '../colors';


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
    flex: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userImageContainer: {
    flex: 8,
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userImage: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
});

class EditProfileScreen extends Component {
  static navigationOptions = () => ({
    title: 'InstaPet',
    headerTintColor: colors.red(1),
    headerStyle: {
      backgroundColor: colors.green1(1),
    },
    headerTitleStyle: {
      color: 'white',
    },
  })

  constructor(props) {
    super(props);
    this.unsubscribe = null;
    const { navigation } = this.props;
    this.userID = navigation.getParam('userID', 'NO-ID');

    this.state = {
      name: '',
      city: '',
      bio: '',
      avatar: '',
      hasCameraPermission: false,
      uploading: false,
    };
  }

  async componentDidMount() {
    this.unsubscribe = db.collection('users').doc(this.userID).onSnapshot(this.onUpdate);

    const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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

    const avatar = await snapshot.ref.getDownloadURL();

    this.setState({ avatar, uploading: false });
  }

  onUpdate = (doc) => {
    this.setState({ ...doc.data() });
  }

  updateProfile = () => {
    if (!this.userID) { return; }

    const {
      name, bio, city, avatar,
    } = this.state;

    db.collection('users').doc(this.userID).update({
      name, bio, city, avatar,
    })
      .then(() => {
        const { navigation } = this.props;
        navigation.goBack();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const {
      name, bio, city, avatar,
      hasCameraPermission, uploading,
    } = this.state;
    const presenter = new UserPresenter({ avatar });

    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flex: 1, marginTop: 0 }}>
          <SettingsList borderColor="transparent" defaultItemSize={50}>
            <SettingsList.Header headerText="UPDATE PROFILE" headerStyle={{ color: colors.grey(1), marginTop: 50 }} />
            <SettingsList.Item
              id="name"
              title="Name"
              isEditable
              hasNavArrow={false}
              value={name}
              onTextChange={text => this.setState({ name: text })}
              placeholder="Scooby Doo"
              icon={(
                <Icon
                  name="rename-box"
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
              )}
            />
            <SettingsList.Item
              id="city"
              title="City"
              isEditable
              hasNavArrow={false}
              value={city}
              onTextChange={text => this.setState({ city: text })}
              placeholder="Woofland, CA"
              icon={(
                <Icon
                  name="city"
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
              )}
            />
            <SettingsList.Item
              id="bio"
              title="Bio"
              isEditable
              hasNavArrow={false}
              value={bio}
              onTextChange={text => this.setState({ bio: text })}
              placeholder="Hello and welcome..."
              icon={(
                <Icon
                  name="comment-text"
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
              )}
            />

            <SettingsList.Item
              id="avatar"
              title="Avatar"
              hasNavArrow={false}
              icon={(
                <Icon
                  name="image"
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
            )}
            />
          </SettingsList>

          <View style={styles.userImageContainer}>
            <Image
              style={styles.userImage}
              source={{
                uri: presenter.avatar,
              }}
            />

            <View style={styles.avatarButtonContainer}>
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
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title=" Publish Changes"
              onPress={this.updateProfile}
              buttonStyle={{ backgroundColor: colors.red(1) }}
              icon={(<Icon name="check" size={16} color="white" />)}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default EditProfileScreen;
