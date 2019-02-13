import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-elements';
import firebase from '../../firestore';
import colors from '../colors';

const db = firebase.firestore();

class ProfileScreen extends Component {
  static navigationOptions = () => ({
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name="account"
        size={24}
        color={tintColor}
      />
    ),
  })

  constructor(props) {
    super(props);
    this.unsubscribe = null;

    this.state = {
      profile: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
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
    this.setState({ profile: doc.data() });
  }

  render() {
    const { profile } = this.state;
    const { navigation } = this.props;

    return (
      <View style={{
        flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
      }}
      >
        <Text>
          Hello,
          {' '}
          {profile && profile.username}
!
        </Text>

        <Button
          title=" Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          buttonStyle={{ backgroundColor: colors.red(1) }}
          icon={(<Icon name="pencil" size={16} color="white" />)}
        />

        <View style={{ paddingTop: 50 }}>
          <Text>
            Your name:
            {' '}
            {profile && profile.name}
          </Text>

          <Text>
            Your city:
            {' '}
            {profile && profile.city}
          </Text>

          <Text>
            Your gender:
            {' '}
            {profile && profile.gender}
          </Text>
        </View>
      </View>
    );
  }
}

export default ProfileScreen;
