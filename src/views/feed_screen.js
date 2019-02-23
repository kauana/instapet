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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from '../../firestore';

const { width, height } = Dimensions.get('window');

const Post = ({post}) => {

  const comment = post.commented_by_user;
  const listItems = comment.map((d) => <Text key={d.t3umcEmI187GfkibsYj7}>{d.t3umcEmI187GfkibsYj7}</Text>);
  const db = firebase.firestore().collection('users')
                .doc(post.post_userID);
  var userName = "";
  db.get().then((doc) => {
    if (doc.exists) {
  
      userName = doc.data().username;
      console.log(userName)
      //console.log('user profile data for', post.post_userID, " is: " , doc.data().username);
    } else {
      console.log('No such document!');
    }
  })


  return (
    <View style={styles.imageContainer}>
      <Image style={styles.image} resizeMode="cover" source={{ uri: post.image_url }} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{post.post_userID}</Text>
        <View style={styles.likesContainer}>
          <Button
            onPress={() => {
              
              Alert.alert('You liked this post!');
            }}
            title="like"
          />
          <Text style={styles.likes}>&hearts; {post.likes}</Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{userName}</Text>
        <Text style={styles.title}>{post.description}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>t3umcEmI187GfkibsYj7 said:</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{listItems}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>#{post.hashtag}</Text>
      </View>
      <View style={styles.textContainer}>
      <TextInput
        style={styles.commentsText}
        editable = {true}
        placeholder= "Add a comment"
      />
      <Button
            onPress={() => {
              Alert.alert('You commented on this post!');
            }}
            title="Add"
          />
      </View>

    </View>
  );
};



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
  
    componentDidMount() {
      this.unsubscribe = this.feed_ref.onSnapshot(this.onCollectionUpdate)
    }
  
    componentWillUnmount() {
      this.unsubscribe();
    }
  
    onCollectionUpdate = (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        const { image_url, likes, description, post_userID, post_time_stamp, followers_ID, hashtag, commented_by_user } = doc.data();
        
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
        });
 
      });
      
      this.setState({
        posts,
        loading: false,
     });
    }
  
    addRandomPost = () => {
      var author_ID_array = ['t3umcEmI187GfkibsYj7', 'MLVHiDjnWdVrw6QAr3fU', 'e1LkpFNjccmNnBMpIP6D'];
      var random_author =  author_ID_array[Math.floor(Math.random() * author_ID_array.length)];
      
      

      function add_random_hashtags() {
        var hash_tag_array = ['cat','dog','rabbit','guinea pig','bird'];
        var random_int = Math.floor(Math.random() * hash_tag_array.length);
        var random_hashtag = [hash_tag_array[random_int]];

        return random_hashtag
      }
      
      function add_random_comments(post_userID) {
        random_comment = []
        if (post_userID == 'MLVHiDjnWdVrw6QAr3fU') {
            random_comment.push({
            "t3umcEmI187GfkibsYj7":'comment' + Math.floor(Math.random()*10)});
            random_comment.push({
              "e1LkpFNjccmNnBMpIP6D":'comment' + Math.floor(Math.random()*10)});

        } else if (post_userID == 'e1LkpFNjccmNnBMpIP6D') {
          random_comment.push({
            "t3umcEmI187GfkibsYj7":'comment' + Math.floor(Math.random()*10)});
        } else {
          random_comment = [];
        }
        return random_comment
      }

      function add_Followers(post_userID) {
        if (post_userID == 'MLVHiDjnWdVrw6QAr3fU') {
          followers_ID = ['e1LkpFNjccmNnBMpIP6D', 't3umcEmI187GfkibsYj7']
        } else if (post_userID == 'e1LkpFNjccmNnBMpIP6D') {
          followers_ID = ['t3umcEmI187GfkibsYj7']
        } else {
          followers_ID = []
        }
        return followers_ID
      }

      this.write_ref.add({
        description: "posted at time" + Date().toLocaleString().substring(15, 25),
        likes: Math.floor((Math.random() * 10) + 1),
        image_url: 'https://source.unsplash.com/collection/190727/300x200',
        post_userID: random_author,
        post_time_stamp: firebase.firestore.FieldValue.serverTimestamp(),
        followers_ID: add_Followers(random_author),
        hashtag: add_random_hashtags(),
        commented_by_user: add_random_comments(random_author),
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
            renderItem={({ item }) => <Post post={item}/>}
          />
          <Button title="Add random post" onPress={() => this.addRandomPost()} />
        </View>
      );
    }

/*     render() {
        // query against cloud store starts here
        const db = firebase.firestore();

 

        return (
            <View style={{
                flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
            }}
            >
                <Text>Hello!</Text>
                <Text>This is the main feed.</Text>
                <Icon name="wrench" size={32} />
                <Text>Under construction.</Text>
            </View>
        );
    } */
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
  },
  title: {
    flex: 4,
  },
  likesContainer: {
    flex: 1,
    justifyContent: 'center',
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
    borderWidth: 0},
});