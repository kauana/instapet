import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsList from 'react-native-settings-list';
import { StackActions, NavigationActions } from 'react-navigation';
import { showMessage } from 'react-native-flash-message';
import firebase from '../../firestore';
import colors from '../colors';

const styles = StyleSheet.create({
  icon: {
    marginLeft: 15,
    marginRight: 10,
    alignSelf: 'center',
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
});

class SettingsScreen extends Component {
  static handleLogout = ({ navigation }) => {
    firebase.auth().signOut().then(() => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Login' })],
      });
      navigation.dispatch(resetAction);
    });
  }

  static navigationOptions = props => ({
    title: 'InstaPet',
    headerTintColor: colors.red(1),
    headerStyle: {
      backgroundColor: colors.green1(1),
    },
    headerTitleStyle: {
      color: 'white',
    },
    headerRight: (
      <Button
        title="Logout"
        onPress={() => SettingsScreen.handleLogout(props)}
        type="clear"
        titleStyle={{ color: colors.red(1) }}
      />
    ),
  })

  constructor(props) {
    super(props);
    this.state = {
      changePassword: false,
      currentPassword: '',
      newPassword: '',
      confirmedPassword: '',
      errorMessage: '',
    };
  }

  toggleChangePassword = () => {
    this.setState(prevState => ({ changePassword: !prevState.changePassword }));
  }

  saveNewPassword = () => {
    const { currentUser } = firebase.auth();
    const { currentPassword, newPassword, confirmedPassword } = this.state;

    if (newPassword !== confirmedPassword) {
      this.setState({ errorMessage: 'Passwords do not match, try again.' });
      return;
    }

    firebase.auth()
      .signInWithEmailAndPassword(currentUser.email, currentPassword)
      .then(({ user }) => {
        user.updatePassword(newPassword).then(() => {
          this.setState({
            errorMessage: '',
            changePassword: false,
            newPassword: '',
            confirmedPassword: '',
          });
          showMessage({
            message: 'Success!',
            description: 'Password successfully changed.',
            type: 'success',
          });
        }).catch(error => this.setState({ errorMessage: error.message }));
      }).catch((error) => {
        this.setState({ errorMessage: error.message });
      });
  }

  renderChangePassword() {
    const {
      changePassword, currentPassword, newPassword, confirmedPassword, errorMessage,
    } = this.state;
    if (!changePassword) {
      return null;
    }

    const items = [
      <SettingsList.Item
        id="password"
        key="password"
        title="Current Password: "
        isEditable
        hasNavArrow={false}
        placeholder="Current Password"
        value={currentPassword}
        onTextChange={password => this.setState({ currentPassword: password })}
      />,
      <SettingsList.Item
        id="password"
        key="password"
        title="New Password: "
        isEditable
        hasNavArrow={false}
        placeholder="New Password"
        value={newPassword}
        onTextChange={password => this.setState({ newPassword: password })}
      />,
      <SettingsList.Item
        id="confirm-password"
        key="confirm-password"
        title="Confirm Password: "
        isEditable
        hasNavArrow={false}
        placeholder="Please confirm new password"
        value={confirmedPassword}
        onTextChange={password => this.setState({ confirmedPassword: password })}
      />,
    ];

    if (errorMessage.length > 0) {
      items.push(
        <SettingsList.Item
          key="password-error"
          title={errorMessage}
          titleStyle={{ color: colors.red(1), textAlign: 'center' }}
          hasNavArrow={false}
        />,
      );
    }

    items.push(
      <SettingsList.Item
        key="save-password"
        title="Save Password"
        titleStyle={{ color: 'white', textAlign: 'center' }}
        backgroundColor={colors.red(1)}
        onPress={this.saveNewPassword}
        hasNavArrow={false}
      />,
    );
    return items;
  }

  render() {
    const { changePassword } = this.state;
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flex: 1, marginTop: 0 }}>
          <SettingsList borderColor={colors.grey(0.2)} defaultItemSize={50}>
            <SettingsList.Header headerText="ACCOUNT" headerStyle={{ color: colors.grey(1), marginTop: 50 }} />
            <SettingsList.Item
              icon={(
                <Icon
                  name="lock-reset"
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
              )}
              title="Change Password"
              onPress={this.toggleChangePassword}
              arrowIcon={(
                <Icon
                  name={changePassword ? 'arrow-down' : 'arrow-right'}
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
              )}
            />
            {this.renderChangePassword()}
          </SettingsList>
        </View>
      </View>
    );
  }
}

export default SettingsScreen;

// Source Tutorials Used:
// https://github.com/evetstech/react-native-settings-list/tree/8592e47cc31ac0c1eb33be54a24032a631786116
// https://firebase.google.com/docs/auth/web/password-auth
// https://www.npmjs.com/package/react-native-flash-message
// https://snack.expo.io/Hy7Y01Yc7
