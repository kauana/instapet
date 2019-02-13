import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsList from 'react-native-settings-list';
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

    this.state = {
      name: '',
      city: '',
      gender: '',

      userID: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ userID: user.uid });
        this.unsubscribe = db.collection('users').doc(user.uid).onSnapshot(this.onUpdate);
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onUpdate = (doc) => {
    this.setState({ ...doc.data() });
  }

  updateProfile = () => {
    const {
      name, gender, city, userID,
    } = this.state;

    db.collection('users').doc(userID).update({ name, gender, city })
      .then(() => {
        const { navigation } = this.props;
        navigation.goBack();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const { name, gender, city } = this.state;

    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flex: 1, marginTop: 0 }}>
          <SettingsList borderColor={colors.grey(0.2)} defaultItemSize={50}>
            <SettingsList.Header headerText="UPDATE PROFILE" headerStyle={{ color: colors.grey(1), marginTop: 50 }} />
            <SettingsList.Item
              id="name"
              title="Name"
              isEditable
              hasNavArrow={false}
              value={name}
              onTextChange={text => this.setState({ name: text })}
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
              id="gender"
              title="Gender"
              isEditable
              hasNavArrow={false}
              value={gender}
              onTextChange={text => this.setState({ gender: text })}
              icon={(
                <Icon
                  name="gender-transgender"
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
              )}
            />
          </SettingsList>

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
