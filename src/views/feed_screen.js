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
import {Notifications, Permissions} from 'expo';



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
      notification: {},
    };  

  }



  async registerForPushNotificationsAsync() {

    let { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

    // Stop here if the user did not grant permissions
    if (status !== 'granted') {
      console.log(status, "you didn't grant permission for notification")
      return;
    }

    
    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    userID = firebase.auth().currentUser.uid;
    
    console.log("feed screen, userID is", userID)
    console.log("feed screen, token is", token)
    console.log("current time", Date())

    firebase.firestore().collection('users').doc(userID).update({ token: token });

    /*
    // change token to the post author's token
    
    console.log('post user token is', token)

    const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
    const tokenArray = [];

    tokenArray.push({
      to: token,
      title: "hello",
      body: "you get new comment",
      sound: "default",
    }
    )
    return fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenArray),
      sound: "default",
    }).then(response => response.json())
      .then(responseJson => console.log('response is :', responseJson, 'token is', token))
      .catch(error => console.error("error is", error));
      */
  }    

  async sendPushNotification() {

    const appUser = firebase.auth().currentUser.uid

    token = await Notifications.getExpoPushTokenAsync();

    const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
    const tokenArray = [];

    tokenArray.push({
      to: token,
      title: "hello",
      body: "notification to app user from sendPushNotification feed screen",
      sound: "default",
    }
    )
    return fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenArray),
      sound: "default",
    }).then(response => response.json())
      .then(responseJson => console.log('response is :', responseJson, 'token is', token))
      .catch(error => console.error("error is", error));

  }



  async componentDidMount() {
    this.unsubscribe = this.feedRef.onSnapshot(this.onPostUpdate); 

    this.registerForPushNotificationsAsync();
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(this._handleNotification);

  }

  _handleNotification = (notification) => {
    //this.setState({notification: notification});
    console.log(notification)
    userID = firebase.auth().currentUser.uid;
    this.props.navigation.navigate('Notifications');
    this.setState({ notification: notification });

    firebase.firestore().collection('users').doc(userID).update({ notifications: notification.data });

  };


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
        <TextInput style={styles.textContainer}
          //onSubmitEditing={this.registerForPushNotificationsAsync}
          //onSubmitEditing={this.sendPushNotification}
          placeholder={'this does nothing'}
        />
        <TextInput style={styles.textContainer}
          onSubmitEditing={this.sendPushNotification}
          //onSubmitEditing={this.sendPushNotification}
          placeholder={'register token and test'}
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
