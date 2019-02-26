import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {
  TextInput,
  Alert,
  Platform,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';

const { width, height } = Dimensions.get('window');

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
    this.feed_ref = firebase.firestore().collection('posts').orderBy("post_time_stamp", 'desc');
    this.write_ref = firebase.firestore().collection('posts');
    this.unsubscribe = null;
    this.state = {
      posts: [],
      loading: true,
    };
  }


  updateComments = (key, index) => {

    console.log(key)
    console.log(index)
    console.log(this.state.commentText)
    console.log('comment captured?')


    let appUser = firebase.auth().currentUser.uid;
    firebase.firestore().collection('posts').doc(key).update({
    commented_by_user: firebase.firestore.FieldValue.arrayUnion({ who: appUser, when: new Date(), contents: this.state.commentText}),
  })

  }

  updateLikes = (key, index) => {
    // add 1 to likesCount each time it is liked; now you cannot unlike a post; you can like it a few times
    // Create a reference to the this post that was liked.
    var postRef = firebase.firestore().collection("posts").doc(key);


    // record who liked this post
    let appUser = firebase.auth().currentUser.uid;
    firebase.firestore().collection('posts').doc(key).update({
      liked_by_user: firebase.firestore.FieldValue.arrayUnion(appUser),
    })

    
    return firebase.firestore().runTransaction(function (transaction) {
      // This code may get re-run multiple times if there are conflicts.
      return transaction.get(postRef).then(function (doc) {
        if (!doc.exists) {
          throw "Document does not exist!";
        }
        var newLikesCount = doc.data().likesCount + 1;
        transaction.update(postRef, { likesCount: newLikesCount });
      });
    }).then(function () {
      console.log("Transaction successfully committed!");
    }).catch(function (error) {
      console.log("Transaction failed: ", error);
    });



  }

  componentDidMount() {
    this.unsubscribe = this.feed_ref.onSnapshot(this.onCollectionUpdate)
  }
  componentWillUnmount() {
    this.unsubscribe();
  }

  onCollectionUpdate = (querySnapshot) => {
    const posts = [];
    const commentText = '';

    var authorUsername = "want to go to user collection and get username";
    let appUser = firebase.auth().currentUser.uid;


    // console.log(authorUsername)
    function getUserName(post_author) {

      var usersRef = firebase.firestore().collection('users');
      usersRef.get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            if (doc.id == post_author) {
              authorUsername = doc.data().username;
              console.log(authorUsername)
              console.log(doc.id)
              console.log(post_author)
              return authorUsername
            }
          });

        })
        .catch(err => {
          console.log('Error getting users', err);
        });
    }




    querySnapshot.forEach((doc) => {
      const { image_url, likes, description, post_userID, post_time_stamp, followers_ID,
        hashtag, commented_by_user, likesCount, post_time_stamp_string } = doc.data();
      /////const db = firebase.firestore().collection('users').doc(post_userID);

      //console.log(user);
      //console.log(followers_ID)
      if (!followers_ID) {
        return;
      }
      if (followers_ID.includes(appUser)) {
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
          authorUsername: getUserName(post_userID),
          likesCount,
          post_time_stamp_string,
        });
      }
    });

    this.setState({
      posts,
      loading: false,
      commentText,
    });
  }

  onCommentChanged = (text) => {
    this.setState({
      commentText: text,
    });
  }


  addRandomPost = () => {
    var author_ID_array = ['8tIDp1pDSnQnq3tsgNwgD1SR3ul1', 'ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3', 'iDJKuWxNYBhz0eUzzfpIyQjD7GE2'];
    var random_author = author_ID_array[Math.floor(Math.random() * author_ID_array.length)];

    function add_random_hashtags() {
      var hash_tag_array = ['cat', 'dog', 'rabbit', 'guinea pig', 'bird'];
      var random_int = Math.floor(Math.random() * hash_tag_array.length);
      var random_hashtag = [hash_tag_array[random_int]];

      return random_hashtag
    }
    function add_random_comments(post_userID) {
      random_comment = []
      if (post_userID == '8tIDp1pDSnQnq3tsgNwgD1SR3ul1') {
        random_comment.push({
          "ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3": 'comment' + Math.floor(Math.random() * 10)
        });
        random_comment.push({
          'iDJKuWxNYBhz0eUzzfpIyQjD7GE2': 'comment' + Math.floor(Math.random() * 10)
        });

      } else if (post_userID == 'ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3') {
        random_comment.push({
          "8tIDp1pDSnQnq3tsgNwgD1SR3ul1": 'comment' + Math.floor(Math.random() * 10)
        });
      } else {
        random_comment = [];
      }
      return random_comment
    }

    function add_Followers(post_userID) {
      if (post_userID == '8tIDp1pDSnQnq3tsgNwgD1SR3ul1') {
        followers_ID = ['ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3', 'iDJKuWxNYBhz0eUzzfpIyQjD7GE2']
      } else if (post_userID == 'ZEk6KN5SRYPtcrc3q8gVjP6Fc0H3') {
        followers_ID = ['iDJKuWxNYBhz0eUzzfpIyQjD7GE2']
      } else {
        followers_ID = ['iDJKuWxNYBhz0eUzzfpIyQjD7GE2']
      }
      return followers_ID
    }

    //post_time_stamp_string: Date().toLocaleString().substring(15, 25),
    this.write_ref.add({
      description: "posted at time" + Date().toLocaleString().substring(15, 25),
      likes: false,
      image_url: 'https://source.unsplash.com/collection/190727/300x200',
      post_userID: random_author,
      post_time_stamp: firebase.firestore.FieldValue.serverTimestamp(),
      followers_ID: add_Followers(random_author),
      hashtag: add_random_hashtags(),
      commented_by_user: add_random_comments(random_author),
      likesCount: 0,
      post_time_stamp_string: Date().toLocaleString().substring(0, 4) + Date().toLocaleString().substring(15, 25),
    });
  }




  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" />;
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.posts}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image style={styles.image} resizeMode="cover" source={{ uri: item.image_url }} />
              <View style={styles.likesContainer}>
                <Text style={styles.likes}>{item.likesCount} &hearts; </Text>
                <Button
                  onPress={() => this.updateLikes(item.key, index)}
                  title= "like"
                />
                <Button
                  onPress={() => {
                    Alert.alert('details of this post including all the comments');
                  }}
                  title="more"
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>by: {item.post_userID}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>by: {item.authorUsername}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>posted at: {item.post_time_stamp_string}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>description: {item.description}</Text>
              </View>
              <View style={styles.textContainer}>
                <TextInput
                  style={styles.commentsText}
                  editable={true}
                  placeholder="Add a comment"
                  // trying to write the comment field string to post's description field for now
                  onChangeText={(text) => this.onCommentChanged(text)}
                />
                <Button
                  onPress={() => this.updateComments(item.key, index)}
                  title="Add"
                />
              </View>
            </View>
          )}
        />
        <Button title="Add random post" onPress={() => this.addRandomPost()} />
      </View>

    );
  }

}


export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width,
    height: 355,
    padding: 0,
    backgroundColor: '#fefefe',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  image: {
    flex: 1,
    width,
    // height: 300,
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
    borderWidth: 0
  },
});