import React, { Component } from 'react';
import {
  ScrollView, FlatList, Animated, Platform, StyleSheet, View, Text, Image, ActivityIndicator, 
  Dimensions, Alert,
} from 'react-native';
import {
  TabView, TabBar, PagerScroll, PagerPan, SceneMap,
} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-elements';
import firebase from '../../firestore';
import colors from '../colors';
import UserPresenter from '../presenters/user_presenter';
import UserRow from './user_row';

const db = firebase.firestore();
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonTitle: {
    fontSize: 14,
    fontFamily: 'regular',
    paddingTop: 0,
  },
  button: {
    borderRadius: 15,
    marginTop: 5,
    width: 120,
    borderWidth: 2,
    padding: 0,
    paddingTop: 2,
    paddingBottom: 2,
  },
  editProfileButton: {
    backgroundColor: colors.red(1),
    borderColor: colors.red(1),
  },
  followButton: {
    backgroundColor: colors.green3(1),
    borderColor: colors.green3(1),
  },
  unfollowButton: {
    backgroundColor: 'transparent',
    borderColor: colors.green3(1),
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
  imageContainer: {
    width,
    height: 400,
    padding: 0,
    backgroundColor: '#fefefe',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  image: {
    flex: 1,
    width,
    marginBottom: 5,
  },
  textContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  title: {
    flex: 4,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
  },
  editDeleteContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  userProfilePostscontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  deleteEditbutton: {
    borderRadius: 15,
    marginTop: 5,
    width: 40,
    borderWidth: 2,
    padding: 0,
    paddingTop: 2,
    paddingBottom: 2,
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
    this.unsubscribeUser = null;
    this.unsubscribeFollowing = null;
    this.unsubscribeFollowed = null;
    this.unsubscribePosts = null;
    const { navigation } = this.props;
    this.userID = navigation.getParam('userID', 'NO-ID');
    this.feed_ref = firebase.firestore().collection('posts').orderBy("post_time_stamp", 'desc');

    this.state = {
      isLoading: true,
      name: '',
      username: '',
      bio: '',
      city: '',
      avatar: '',
      tabs: {
        index: 0,
        routes: [
          { key: 'posts', title: 'posts', count: 31 },
          { key: 'following', title: 'following', count: 0 },
          { key: 'followers', title: 'followers', count: 0 },
        ],
      },

      following: [],
      followed: [],
      posts: [],
    };
    
  }

  componentDidMount() {
    this.unsubscribeUser = db.collection('users').doc(this.userID).onSnapshot(this.onUpdateUser);
    this.unsubscribeFollowing = db.collection('following').doc(this.userID).onSnapshot(this.onUpdateFollowing);
    this.unsubscribeFollowed = db.collection('followed').doc(this.userID).onSnapshot(this.onUpdateFollowed);
    this.unsubscribePosts = this.feed_ref.onSnapshot(this.onPostUpdate)
  }

  componentWillUnmount() {
    if (this.unsubscribeUser) {
      this.unsubscribeUser();
      this.unsubscribeFollowing();
      this.unsubscribeFollowed();
      this.unsubscribePosts();
    }
  }

  onPostUpdate = (querySnapshot) => {
    const posts = [];
    let appUser = firebase.auth().currentUser.uid;

    querySnapshot.forEach((doc) => {
      const { image_url, likes, description, post_userID, post_time_stamp, followers_ID,
        hashtag, commented_by_user, likesCount, post_time_stamp_string } = doc.data();

      if (post_userID == appUser) {
        console.log("true")
        posts.push({
          key: doc.id, // Document ID
          doc, // DocumentSnapshot
          image_url,
          likes,
          description,
          post_userID,
          post_time_stamp,
          followers_ID,
          hashtag,
          commented_by_user,
          likesCount,
          post_time_stamp_string,
        });
        console.log(posts.length)
      }
    });

    this.setState({
      posts,
    });
  }


  onUpdateUser = (doc) => {
    this.setState({ ...doc.data(), isLoading: false });
  }

  // get the user IDs of the user we are looking at follows
  onUpdateFollowing = (doc) => {
    if (!doc.exists) {
      db.collection('following').doc(this.userID).set({});
      return;
    }

    const { tabs } = this.state;
    const userIDs = Object.keys(doc.data());
    tabs.routes[1].count = userIDs.length;
    this.setState({ following: userIDs, tabs });
  }

  // get the user IDs of the users that follow the user we are looking at
  onUpdateFollowed = (doc) => {
    if (!doc.exists) {
      db.collection('followed').doc(this.userID).set({});
      return;
    }

    const { tabs } = this.state;
    const userIDs = Object.keys(doc.data());
    tabs.routes[2].count = userIDs.length;
    this.setState({ followed: userIDs, tabs });
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

  // show either follow, unfollow, edit profile button
  renderProfileAction = () => {
    const user = firebase.auth().currentUser;
    const { navigation } = this.props;
    const { followed } = this.state;

    if (user.uid === this.userID) {
      return (
        <Button
          title=" Edit Profile"
          onPress={() => navigation.navigate('EditProfile', { userID: this.userID })}
          titleStyle={styles.buttonTitle}
          buttonStyle={[styles.button, styles.editProfileButton]}
          icon={(<Icon name="pencil" size={16} color="white" />)}
        />
      );
    }

    if (followed.includes(user.uid)) {
      return (
        <Button
          title=" Unfollow"
          onPress={this.removeFollower}
          titleStyle={[styles.buttonTitle, { color: colors.green3(1) }]}
          buttonStyle={[styles.button, styles.unfollowButton]}
          icon={(<Icon name="check" size={16} color={colors.green3(1)} />)}
        />
      );
    }
    return (
      <Button
        title=" Follow"
        onPress={this.addFollower}
        titleStyle={[styles.buttonTitle, { color: colors.grey(1) }]}
        buttonStyle={[styles.button, styles.followButton]}
        icon={(<Icon name="account-plus" size={16} color={colors.grey(1)} />)}
      />
    );
  }

  removeFollower = () => {
    const user = firebase.auth().currentUser;

    db.collection('following').doc(user.uid).update({
      [this.userID]: firebase.firestore.FieldValue.delete(),
    });

    db.collection('followed').doc(this.userID).update({
      [user.uid]: firebase.firestore.FieldValue.delete(),
    });
  }

  addFollower = () => {
    const user = firebase.auth().currentUser;

    db.collection('following').doc(user.uid).update({
      [this.userID]: true,
    });

    db.collection('followed').doc(this.userID).update({
      [user.uid]: true,
    });
  }

  renderContactHeader = () => {
    const { name, username, avatar } = this.state;
    const presenter = new UserPresenter({ name, username, avatar });

    return (
      <View style={styles.headerContainer}>
        <View style={styles.userImageContainer}>
          <Image
            style={styles.userImage}
            source={{
              uri: presenter.avatar,
            }}
          />
          {this.renderProfileAction()}
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.userRow}>
            <View style={styles.userNameRow}>
              <Text style={styles.userNameText}>{presenter.name}</Text>
            </View>
            {this.renderCity()}
            {this.renderBio()}
          </View>
        </View>
      </View>
    );
  }

          
  renderPosts = () => {
    
    return (
        <View style={styles.userProfilePostscontainer}>
          <FlatList
            data={this.state.posts}
            renderItem={({ item, index }) => (
              <View style={styles.imageContainer}>
                <Image style={styles.image} resizeMode="cover" source={{ uri: item.image_url }} />
                <View style={styles.editDeleteContainer}>
                  <Button 
                    onPress={() => {
                      Alert.alert('edit this post--to be implemented');
                    }}
                    title="edit"
                  />
                  <Button
                    onPress={() => {
                      Alert.alert('delete this post--to be implemented');
                    }}
                    title="delete"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>delete after testing posted by: {item.post_userID}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>posted at: {item.post_time_stamp_string}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>description: {item.description}</Text>
                </View>
              </View>
            )}
          />
        </View>
  
      );
                
  }

  renderUserList = (userIDs) => {
    const { navigation } = this.props;

    return (
      <FlatList
        data={userIDs}
        keyExtractor={item => item}
        renderItem={({ item }) => <UserRow navigation={navigation} userID={item} />}
      />
    );
  }

  render() {
    const {
      isLoading, tabs, following, followed,
    } = this.state;
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.red(1)} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {this.renderContactHeader()}
        <TabView
          style={styles.tabContainer}
          navigationState={tabs}
          renderPager={this.renderPager}
          renderScene={SceneMap({
            posts: () => this.renderPosts(),
            following: () => this.renderUserList(following),
            followers: () => this.renderUserList(followed),
          })}
          renderTabBar={this.renderTabBar}
          onIndexChange={this.handleIndexChange}
        />
      </View>
    );
  }
}

export default ProfileScreen;

// Source Tutorials used:
// https://github.com/nattatorn-dev/react-native-user-profile/tree/e827360142409421458dda67b119ae9488a8f523
