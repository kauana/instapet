import React, { Component } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableHighlight,
} from 'react-native';
import firebase from '../../firestore';
import colors from '../colors';
import UserPresenter from '../presenters/user_presenter';

const db = firebase.firestore();

const styles = StyleSheet.create({
  usersResult: {
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey(0.1),
  },
  cityRow: {
    marginBottom: 10,
  },
  cityText: {
    color: colors.grey(1),
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'light',
  },
  userNameTextTabs: {
    color: colors.grey(1),
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'bold',
  },
  userImageTab: {
    borderRadius: 40,
    height: 80,
    width: 80,
    marginRight: 10,
  },
  usernameRowTabs: {
    marginBottom: 10,
  },
  cityTextTabs: {
    color: colors.grey(1),
    fontSize: 12,
    fontFamily: 'light',
  },
});

class UserRow extends Component {
  constructor(props) {
    super(props);
    this.unsubscribeUser = null;
    this.userID = props.userID;

    this.state = {
      isLoading: true,
      name: '',
      username: '',
      city: '',
      avatar: '',
    };
  }

  componentDidMount() {
    this.unsubscribeUser = db.collection('users').doc(this.userID).onSnapshot(this.onUpdateUser);
  }

  componentWillUnmount() {
    if (this.unsubscribeUser) {
      this.unsubscribeUser();
    }
  }

  onUpdateUser = (doc) => {
    this.setState({ ...doc.data(), isLoading: false });
  }

  render() {
    const { navigation } = this.props;
    const {
      name, username, city, avatar, isLoading,
    } = this.state;

    if (isLoading) {
      return null;
    }

    const presenter = new UserPresenter({ name, username, avatar });

    return (
      <TouchableHighlight
        underlayColor={colors.grey(0.1)}
        onPress={
          () => navigation.push('UserProfile', { userID: this.userID })
        }
      >
        <View style={styles.usersResult}>
          <Image
            style={styles.userImageTab}
            source={{ uri: presenter.avatar }}
          />
          <View style={{ flexDirection: 'column' }}>
            <View style={styles.usernameRowTabs}>
              <Text style={styles.userNameTextTabs}>{presenter.name}</Text>
            </View>
            {
              city && city.length > 0
                ? (
                  <View style={styles.cityRow}>
                    <Text style={styles.cityTextTabs}>{`Location: ${city}`}</Text>
                  </View>
                )
                : null
            }
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

export default UserRow;
