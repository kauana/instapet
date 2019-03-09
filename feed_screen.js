import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InputScrollView from 'react-native-input-scroll-view';
import Post from './post';
import firebase from '../../firestore';
// from here
import {Constants, Notifications, Permissions} from 'expo';

const { width } = Dimensions.get('window');
const db = firebase.firestore();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width,
    height: 400,
    padding: 0,
    backgroundColor: '#fefefe',
    alignItems: 'center',
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
    alignSelf: 'flex-start',
    fontSize: 50,
    paddingLeft: 15,
    paddingRight: 15,
  },
  title: {
    flex: 4,
  },
  likesContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingLeft: 15,
  },
  headerContainer: {
    width,
    height: Platform.OS === 'ios' ? 70 : 50,
    backgroundColor: '#fefefe',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
  },
  commentsText: {
    height: 40,
    width: 300,
    borderColor: 'gray',
    borderWidth: 0,
  },
});

class FeedScreen extends Component {

  static navigationOptions = () => ({
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name="home"
        size={24}
        color={tintColor}
      />
    ),
  })

  constructor() {
    super();
    const appUser = firebase.auth().currentUser.uid;
    this.feedRef = db.collection('posts')
      .orderBy('timestamp', 'desc')
      .where('followerIDs', 'array-contains', appUser);
    this.unsubscribe = null;
    this.state = {
      posts: [],
      loading: true,
    };  

  }

async registerForPushNotificationsAsync() {
  
  let { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

  // Stop here if the user did not grant permissions
  if (status !== 'granted') {
    console.log(status,"you didn't grant permission for notification")
    return;
  }
  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync();

  userID = firebase.auth().currentUser.uid;
  console.log("feed screen, userID is", userID)
  console.log("feed screen, token is",token)
  firebase.firestore().collection('users').doc(userID).update({ token: token });
}    



  async componentDidMount() {
    this.unsubscribe = this.feedRef.onSnapshot(this.onPostUpdate); 

  }

  componentWillUnmount() {
    this.unsubscribe();
  }


  updateComments = (key, index) => {
    const { commentText } = this.state;
    console.log(key);
    console.log(index);
    console.log(commentText);


    const appUser = firebase.auth().currentUser.uid;
    firebase.firestore().collection('posts').doc(key).update({
      commentedByUser: firebase.firestore.FieldValue.arrayUnion({
        who: appUser,
        when: new Date(),
        contents: commentText,
      }),
    });
  }

  onPostUpdate = async (querySnapshot) => {
    const posts = [];
    const promises = [];

    querySnapshot.forEach((doc) => {
      const {
        imageURL, likedByUsers, description, userID, timestamp, followed,
        commentedByUsers,
      } = doc.data();

      promises.push(db.collection('users').doc(userID).get()
        .then((userDoc) => {
          posts.push({
            key: doc.id,
            imageURL,
            description,
            timestamp,
            followed,
            commentedByUsers,
            likedByUsers,
            userID,
            user: userDoc.data(),
          });
        })
        .catch(error => console.log(error)));
    });


    await Promise.all(promises);

    this.setState({ posts, loading: false });
  }

  onCommentChanged = (text) => {
    this.setState({
      commentText: text,
    });
  }


  render() {
    const { posts, loading } = this.state;
    const { navigation } = this.props;

    if (loading) {
      return <ActivityIndicator size="large" />;
    }
    return (
      <View style={styles.container}>
        <TextInput style = {styles.textContainer}
          onSubmitEditing={this.registerForPushNotificationsAsync}
          placeholder={'type in something, press enter to save token to fire store'}
        />
  
        <InputScrollView>
          <FlatList
            data={posts}
            renderItem={({ item }) => (
              <Post post={item} user={item.user} navigation={navigation} />
            )}
          />
        </InputScrollView>
      </View>
    );
  }
}

export default FeedScreen;
