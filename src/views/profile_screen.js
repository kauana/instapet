import React, { Component } from 'react';
import {
  ScrollView, Animated, Platform, StyleSheet, View, Text, Image,
} from 'react-native';
import {
  TabView, TabBar, PagerScroll, PagerPan, SceneMap,
} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-elements';
import firebase from '../../firestore';
import colors from '../colors';

const db = firebase.firestore();

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
  },
  userImageContainer: {
    marginLeft: 10,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
  },
  indicatorTab: {
    backgroundColor: 'transparent',
  },
  scroll: {
    backgroundColor: '#FFF',
  },
  sceneContainer: {
    marginTop: 10,
  },
  tabBar: {
    backgroundColor: colors.green1(1),
  },
  tabContainer: {
    flex: 1,
    marginBottom: 12,
  },
  tabLabelText: {
    color: 'gray',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'regular',
  },
  tabLabelNumber: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'bold',
  },
  bioRow: {},
  bioText: {
    color: colors.grey(1),
    fontSize: 13.5,
    textAlign: 'center',
    fontFamily: 'regular',
  },
  userImage: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
  editProfileButton: {
    backgroundColor: colors.red(1),
    borderRadius: 20,
    height: 20,
    marginTop: 5,
  },
  userNameRow: {
    marginBottom: 10,
  },
  userNameText: {
    color: colors.grey(1),
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'bold',
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
  userRow: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 12,
  },
});

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
      name: '',
      username: '',
      bio: '',
      city: '',
      avatar: '',
      tabs: {
        index: 0,
        routes: [
          { key: 'posts', title: 'posts', count: 31 },
          { key: 'following', title: 'following', count: 95 },
          { key: 'followers', title: 'followers', count: '1.3 K' },
        ],
      },
    };
  }

  componentDidMount() {
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
    this.setState({ ...doc.data() });
  }

  handleIndexChange = (index) => {
    this.setState(prevState => ({
      tabs: {
        ...prevState.tabs,
        index,
      },
    }));
  }

  renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicatorTab}
      renderLabel={this.renderLabel(props)}
      pressOpacity={0.8}
      style={styles.tabBar}
    />
  )

  renderLabel = props => ({ route }) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    const index = props.navigationState.routes.indexOf(route);
    const outputRange = inputRange.map(
      inputIndex => (inputIndex === index ? colors.grey(1) : 'white'),
    );
    const color = props.position.interpolate({
      inputRange,
      outputRange,
    });

    return (
      <View>
        <Animated.Text style={[styles.tabLabelNumber, { color }]}>
          {route.count}
        </Animated.Text>
        <Animated.Text style={[styles.tabLabelText, { color }]}>
          {route.title}
        </Animated.Text>
      </View>
    );
  }

  renderPager = props => (Platform.OS === 'ios' ? (
    <PagerScroll {...props} />
  ) : (
    <PagerPan {...props} />
  ))

  presentName = () => {
    const { name, username } = this.state;
    let text = username;
    if (name.length > 0) {
      text += ` (${name})`;
    }
    return text;
  }

  renderCity = () => {
    const { city } = this.state;
    if (city.length === 0) return null;

    return (
      <View style={styles.cityRow}>
        <Text style={styles.cityText}>{`Location: ${city}`}</Text>
      </View>
    );
  }

  renderBio = () => {
    const { bio } = this.state;
    if (bio.length === 0) return null;

    return (
      <View style={styles.bioRow}>
        <Text style={styles.bioText}>{bio}</Text>
      </View>
    );
  }

  renderContactHeader = () => {
    const { avatar } = this.state;
    const { navigation } = this.props;
    const defaultAvatar = 'https://www.petinsurancereview.com/sites/default/files/styles/large/public/default_images/default_pet.jpg?itok=xSpT8Z_k';

    return (
      <View style={styles.headerContainer}>
        <View style={styles.userImageContainer}>
          <Image
            style={styles.userImage}
            source={{
              uri: avatar.length > 0 ? avatar : defaultAvatar,
            }}
          />

          <Button
            title=" Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            titleStyle={{ fontSize: 10 }}
            buttonStyle={styles.editProfileButton}
            icon={(<Icon name="pencil" size={12} color="white" />)}
          />
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.userRow}>
            <View style={styles.userNameRow}>
              <Text style={styles.userNameText}>{this.presentName()}</Text>
            </View>
            {this.renderCity()}
            {this.renderBio()}
          </View>
        </View>
      </View>
    );
  }

  renderPosts = () => <Text>Posts</Text>

  renderFollowing = () => <Text>Following</Text>

  renderFollowers = () => <Text>Followers</Text>

  render() {
    const { tabs } = this.state;
    return (
      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          <View style={styles.cardContainer}>
            {this.renderContactHeader()}
            <TabView
              style={styles.tabContainer}
              navigationState={tabs}
              renderPager={this.renderPager}
              renderScene={SceneMap({
                posts: this.renderPosts,
                following: this.renderFollowing,
                followers: this.renderFollowers,
              })}
              renderTabBar={this.renderTabBar}
              onIndexChange={this.handleIndexChange}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default ProfileScreen;
