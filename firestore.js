import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyBu3EWDpvRc8wlYVRmPj92tG5ERjuolTws',
  authDomain: 'hello-world-reactnative.firebaseapp.com',
  databaseURL: 'https://hello-world-reactnative.firebaseio.com',
  projectId: 'hello-world-reactnative',
  storageBucket: 'hello-world-reactnative.appspot.com',
  messagingSenderId: '142892966553',
};
firebase.initializeApp(config);

export default firebase;
