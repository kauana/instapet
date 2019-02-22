import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {
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
  const comment =[{"name":"cm1"},{"name":"cm2"}];
  const listItems = comment.map((d) => <Text key={d.name}>{d.name}</Text>);

  return (
    <View style={styles.imageContainer}>
      <Image style={styles.image} resizeMode="cover" source={{ uri: post.image_url }} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{post.description} by {post.post_userID}</Text>
        <Text style={styles.title}>{listItems}</Text>
        <View style={styles.likesContainer}>
          <Text style={styles.likes}>&hearts; {post.likes}</Text>
        </View>
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
      this.ref = firebase.firestore().collection('posts');
      this.unsubscribe = null;
      this.state = {
        posts: [],
        loading: true,
      };
    }
  
    componentDidMount() {
      this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)
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
      var hash_tag_array = ['cat','dog','rabbit'];
      var random_hashtag = hash_tag_array[Math.floor(Math.random() * hash_tag_array.length)];

      var random_comment = [];

      for( var i=0; i< 2; i++) {
        random_comment.push({
                "t3umcEmI187GfkibsYj7":'cm' + Math.floor(Math.random()*10)
        });
      }

      function add_Followers(post_userID) {
        if (post_userID == 'MLVHiDjnWdVrw6QAr3fU') {
          followers_ID = ['e1LkpFNjccmNnBMpIP6D', 't3umcEmI187GfkibsYj7']
        } else if (post_userID == 'e1LkpFNjccmNnBMpIP6D') {
          followers_ID = ['t3umcEmI187GfkibsYj7']
        }
        return followers_ID
      }

      this.ref.add({
        description: "just added! a random post" + Math.floor((Math.random() * 100) + 1),
        likes: Math.floor((Math.random() * 10) + 1),
        image_url: 'https://source.unsplash.com/collection/190727/300x200',
        post_userID: random_author,
        post_time_stamp: firebase.firestore.FieldValue.serverTimestamp(),
        followers_ID: add_Followers(random_author),
        hashtag: [random_hashtag],
        commented_by_user: random_comment,
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
    height: 315,
    padding: 25,
    backgroundColor: '#fefefe',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: 300,
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
});