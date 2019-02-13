import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsList from 'react-native-settings-list';
import { StackActions, NavigationActions } from 'react-navigation';
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
  static navigationOptions = ({ navigation }) => ({
    title: 'InstaPet',
    headerLeft: null,
    headerTintColor: colors.red(1),
    headerStyle: {
      backgroundColor: colors.green1(1),
    },
    headerTitleStyle: {
      color: 'white',
    },
    headerRight: (
      <Button
        onPress={() => navigation.goBack()}
        icon={(
          <Icon
            name="menu"
            size={32}
            color={colors.red(1)}
          />
        )}
        type="clear"
      />
    ),
  })

  componentDidMount() {
    const { navigation } = this.props;

    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: 'Login' })],
        });
        navigation.dispatch(resetAction);
      }
    });
  }

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flex: 1, marginTop: 0 }}>
          <SettingsList borderColor={colors.grey(0.2)} defaultItemSize={50}>
            <SettingsList.Header headerText="ACCOUNT" headerStyle={{ color: colors.grey(1), marginTop: 50 }} />
            <SettingsList.Item
              icon={(
                <Icon
                  name="logout-variant"
                  size={24}
                  color={colors.red(1)}
                  style={styles.icon}
                />
              )}
              title="Logout"
              onPress={() => firebase.auth().signOut()}
            />
          </SettingsList>
        </View>
      </View>
    );
  }
}

export default SettingsScreen;
