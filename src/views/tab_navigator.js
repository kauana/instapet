import React from 'react';
import { View } from 'react-native';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../colors';

import FeedScreen from './feed_screen';
import ProfileScreen from './profile_screen';

const CameraScreen = () => (<View />);
CameraScreen.navigationOptions = () => ({ tabBarIcon: ({ tintColor }) => (<Icon name="camera" size={24} color={tintColor} />) });
const SearchScreen = () => (<View />);
SearchScreen.navigationOptions = () => ({ tabBarIcon: ({ tintColor }) => (<Icon name="magnify" size={24} color={tintColor} />) });
const FavoritesScreen = () => (<View />);
FavoritesScreen.navigationOptions = () => ({ tabBarIcon: ({ tintColor }) => (<Icon name="heart" size={24} color={tintColor} />) });

const TabNavigator = createMaterialBottomTabNavigator({
  Profile: ProfileScreen,
  Feed: FeedScreen,
  Camera: CameraScreen,
  Search: SearchScreen,
  Favorites: FavoritesScreen,
}, {
  initialRouteName: 'Profile',
  activeColor: colors.red(1),
  inactiveColor: 'white',
  barStyle: { backgroundColor: colors.green1(1) },
  labeled: false,
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
