import React from 'react';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../colors';

import FeedScreen from './feed_screen';
import ProfileScreen from './profile_screen';

const TabNavigator = createMaterialBottomTabNavigator({
  Feed: FeedScreen,
  Profile: ProfileScreen,
}, {
  initialRouteName: 'Feed',
  activeColor: colors.red(1),
  inactiveColor: 'white',
  barStyle: { backgroundColor: colors.green1(1) },
});

TabNavigator.navigationOptions = ({ navigation }) => ({
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
      onPress={() => navigation.navigate('Settings')}
      icon={(
        <Icon
          name="menu"
          size={32}
          color="white"
        />
        )}
      type="clear"
    />
  ),
});

export default TabNavigator;
