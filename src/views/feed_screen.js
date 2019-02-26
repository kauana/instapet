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

    ///// don't know how to update the single post. need some index in posts?
    ///// const {description} = this.state.posts[index].description;
    //console.log('try to update')
    //console.log(key)
    //console.log(index)
    // fire store will be updated if we redefine description as below
    var description = "press add comment button will change the description; need to post actual comments"

    firebase.firestore().collection('posts').doc(key).update({
      description,
    })
  }


  componentDidMount() {
    this.unsubscribe = this.feed_ref.onSnapshot(this.onCollectionUpdate)
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  onCollectionUpdate = (querySnapshot) => {
    const posts = [];
    var authorUsername = "want to go to user collection and get username";
    let user = firebase.auth().currentUser.uid;

   
   // console.log(authorUsername)
    function getUserName(post_author) {

      var usersRef = firebase.firestore().collection('users');
      usersRef.get()
            .then(snapshot => {     
                snapshot.forEach(doc => {
                  if (doc.id == post_author) {
                    authorUsername =  doc.data().username;
                    console.log(authorUsername)
                    console.log(doc.id)
                    console.log(post_author)
                  }
                });
                return authorUsername   
            })
            .catch(err => {
                console.log('Error getting users', err);
            });
  }

  
  /*
    function getUserName(post_author) {
      return firebase.firestore().collection("users").doc(post_author).get().then(function(doc) {
        return doc.data().username;     
       })
    }

    */



    querySnapshot.forEach((doc) => {
      const { image_url, likes, description, post_userID, post_time_stamp, followers_ID, 
        hashtag, commented_by_user, likesCount, post_time_stamp_string } = doc.data();
      /////const db = firebase.firestore().collection('users').doc(post_userID);

      //console.log(user);
      //console.log(followers_ID)
      if (!followers_ID) {
        return;
      }
      if (followers_ID.includes(user)) {
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
          authorUsername : getUserName(post_userID),
          likesCount,
          post_time_stamp_string,
        });
      }
  });

    this.setState({
    posts,
    loading: false,
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
                onPress={() => {
                  Alert.alert('need to increase number of likes count!');
                }}
                title="like"
              />
              <Button
                onPress={() => {
                  Alert.alert('details of this post including all comments');
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
                onTextChange={text => this.setState({ description: text })}
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