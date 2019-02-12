import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from '../../firestore';

class FeedScreen extends Component {
  static navigationOptions = {
    title: 'InstaPet',
    headerLeft: null,
    headerTransparent: true,
    headerTintColor: 'rgba(178, 91, 110, 0.5)',
    headerTitleStyle: {
      color: 'white',
    },
  }

  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      } else {
        navigation.navigate('Login');
      }
    });
  }

  render() {
    const { user } = this.state;

    // query against cloud store starts here
    console.log("hello");
    const db = firebase.firestore();

    //query 1: given a key for users, get the users detail
    var docRef = db.collection("users").doc("MLVHiDjnWdVrw6QAr3fU");

    docRef.get().then(function(doc) {
      if (doc.exists) {
        console.log("user data is :", doc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });

    console.log("after_hello_feed_screen_q1");

    //query 2: given a user, find all posts the user made
    // Create a reference to the posts collection
    var postsRef = db.collection("posts");

    // Create a query against the collection.
    db.collection("posts").where("post_userID", "==", "MLVHiDjnWdVrw6QAr3fU")
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
          });
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });


    console.log("after_hello_feed_screen_q2");

    //query 3: given a user, find all users the user follows
    db.collection("followed").doc("t3umcEmI187GfkibsYj7")
        .get()
        .then(function(doc) {
          if (doc.exists) {
            console.log("the users the app user follows are:", doc.data());
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch(function(error) {
      console.log("Error getting document:", error);
    });


    //query 4: given a user, find all posts from the people that the user follows

    console.log("after_hello_feed_screen_q3");



    return (
      <View style={{
        flex: 1, backgroundColor: 'green', justifyContent: 'center', alignItems: 'center',
      }}
      >
        <Text>{user && user.email}</Text>
        <Text>{"hello"}</Text>
      </View>
    );
  }
}

export default FeedScreen;
