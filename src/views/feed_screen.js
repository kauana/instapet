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

    //query 1: user profile details for user MLVHiDjnWdVrw6QAr3fU is
    db.collection("users")
        .doc("MLVHiDjnWdVrw6QAr3fU")
        .get().then(function(doc) {
      if (doc.exists) {
        console.log("user profile data for MLVHiDjnWdVrw6QAr3fU is :", doc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });



    //query 2: given a user, find all posts the user made

    db.collection("posts")
        .where("post_userID", "==", "MLVHiDjnWdVrw6QAr3fU")
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log("MLVHiDjnWdVrw6QAr3fU posted these pictures: ", doc.data().image_url);
          });
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });



    //query 3: given a user, find all users the user follows
    db.collection("followed")
        .doc("t3umcEmI187GfkibsYj7")
        .get()
        .then(function(doc) {
          if (doc.exists) {
            console.log("app user t3umcEmI187GfkibsYj7 follows these users:", doc.data());
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch(function(error) {
      console.log("Error getting document:", error);
    });


    //query 4: given a user t3umcEmI187GfkibsYj7, find all posts from the people that the user follows
    db.collection("posts")
        .where("followers_ID", "array-contains", "t3umcEmI187GfkibsYj7")
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log("all posts should be shown for t3umcEmI187GfkibsYj7 are ", doc.data().image_url);
          });
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });




    // query 5: given a hashtag, find all posts with this hashtag

    db.collection("posts")
        .where("hashtag", "array-contains", "snow")
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log("posts contains hashtag \"snow\" are => ",  doc.data().image_url, doc.data().hashtag);
          });
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });


    // query 6: given a post, find all comments for this post

    db.collection("posts")
        .doc("KOTXpXKf1BagqattgKt5")
        .get()
        .then(function(doc) {

            // doc.data() is never undefined for query doc snapshots
            console.log("post KOTXpXKf1BagqattgKt5 has these comments: ", doc.data().commented_by_user);

        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });

    // query 7: given a post, find the followers that liked this post

    db.collection("posts")
        .doc("KOTXpXKf1BagqattgKt5")
        .get()
        .then(function(doc) {

          // doc.data() is never undefined for query doc snapshots
          // console.log("these followers liked post KOTXpXKf1BagqattgKt5: ", doc.id, doc.data().liked_by_users);
          console.log("these followers liked post KOTXpXKf1BagqattgKt5: ", doc.data().liked_by_users);

        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });


    // query 8: given a user, find all the posts that the user liked

    db.collection("posts")
        .where("liked_by_users", "array-contains", "t3umcEmI187GfkibsYj7")
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log("t3umcEmI187GfkibsYj7 liked these posts => ",doc.id,  doc.data().image_url);
            console.log("t3umcEmI187GfkibsYj7 liked these posts => ",  doc.data().image_url);
          });
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });


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
