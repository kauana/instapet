import React, { Component } from 'react';
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
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';

const { width } = Dimensions.get('window');

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
    this.feed_ref = firebase.firestore().collection('posts').orderBy('timestamp', 'desc');
    this.write_ref = firebase.firestore().collection('posts');
    this.unsubscribe = null;
    this.state = {
      posts: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.unsubscribe = this.feed_ref.onSnapshot(this.onCollectionUpdate);
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

  updateLikes = (key) => {
    // add 1 to likesCount each time it is liked; now you cannot unlike a post;
    // you can like it a few times
    // Create a reference to the this post that was liked.
    const postRef = firebase.firestore().collection('posts').doc(key);

    // record who liked this post
    const appUser = firebase.auth().currentUser.uid;
    firebase.firestore().collection('posts').doc(key).update({
      likedByUsers: firebase.firestore.FieldValue.arrayUnion(appUser),
    });

    return firebase.firestore().runTransaction((transaction) => {
      transaction.get(postRef).then((doc) => {
        if (!doc.exists) {
          throw 'Document does not exist!';
        }
        const newLikesCount = doc.data().likesCount + 1;
        transaction.update(postRef, { likesCount: newLikesCount });
      });
    }).then(() => {
      console.log('Transaction successfully committed!');
    }).catch((error) => {
      console.log('Transaction failed: ', error);
    });
  }

  onCollectionUpdate = (querySnapshot) => {
    const posts = [];
    const commentText = '';

    let authorUsername = 'want to go to user collection and get username';
    const appUser = firebase.auth().currentUser.uid;

    function getUserName(postAuthor) {
      const usersRef = firebase.firestore().collection('users');
      usersRef.get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            if (doc.id === postAuthor) {
              authorUsername = doc.data().username;
              console.log(authorUsername);
              console.log(doc.id);
              console.log(postAuthor);
              return authorUsername;
            }
            return '';
          });
        })
        .catch((err) => {
          console.log('Error getting users', err);
        });
    }

    querySnapshot.forEach((doc) => {
      const {
        imageURL, likes, description, userID, timestamp, followerIDs,
        commentedByUser, likesCount, timestampString,
      } = doc.data();
      if (!followerIDs) {
        return;
      }
      if (followerIDs.includes(appUser)) {
        posts.push({
          key: doc.id, // Document ID
          doc, // DocumentSnapshot
          imageURL,
          likes,
          description,
          userID,
          timestamp,
          followerIDs,
          commentedByUser,
          authorUsername: getUserName(userID),
          likesCount,
          timestampString,
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

  render() {
    const { posts, loading } = this.state;
    if (loading) {
      return <ActivityIndicator size="large" />;
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image style={styles.image} resizeMode="cover" source={{ uri: item.imageURL }} />
              <View style={styles.likesContainer}>
                <Text style={styles.likes}>
                  {item.likesCount}
                  {' '}
                  &hearts;
                  {' '}
                </Text>
                <Button
                  onPress={() => this.updateLikes(item.key, index)}
                  title="like"
                />
                <Button
                  onPress={() => {
                    Alert.alert('details of this post including all the comments');
                  }}
                  title="more"
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  by:
                  {item.userID}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  by:
                  {item.authorUsername}
                  {' '}
                  user name not shown here
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  posted at:
                  {item.timestampString}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  description:
                  {item.description}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <TextInput
                  style={styles.commentsText}
                  editable
                  placeholder="Add a comment"
                  // trying to write the comment field string to post's description field for now
                  onChangeText={text => this.onCommentChanged(text)}
                />
                <Button
                  onPress={() => this.updateComments(item.key, index)}
                  title="Add"
                />
              </View>
            </View>
          )}
        />
      </View>
    );
  }
}

export default FeedScreen;
