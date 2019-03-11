// Source tutorial: https://itnext.io/how-to-add-fast-realtime-search-to-your-firebase-app-with-algolia-2491f7698d52
// Hashtags http://geekcoder.org/js-extract-hashtags-from-text/
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Promise = require('promise');
const cors = require('cors')({ origin: true });
const auth = require('basic-auth');
const request = require('request');
const algoliasearch = require('algoliasearch');
const { Expo } = require('expo-server-sdk');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const expo = new Expo();

exports.processHashtagsCreate = functions.firestore.document('posts/{postID}')
  .onCreate((snap, context) => {
    const postDescription = snap.data().description;
    const hashtags = parseHashtags(postDescription);

    // data is what goes to algolia
    const data = {
      objectID: context.params.postID,
      hashtags,
    };

    return addToAlgolia(data, 'posts')
      .then(res => console.log('SUCCESS ALGOLIA post ADD', res))
      .catch(err => console.log('ERROR ALGOLIA post ADD', err));
  });

exports.processHashtagsUpdate = functions.firestore.document('posts/{postID}')
  .onUpdate((change, context) => {
    const postDescription = change.after.data().description;
    const hashtags = parseHashtags(postDescription);

    // data is what goes to algolia
    const data = {
      objectID: context.params.postID,
      hashtags,
    };

    return editToAlgolia(data, 'posts')
      .then(res => console.log('SUCCESS ALGOLIA post ADD', res))
      .catch(err => console.log('ERROR ALGOLIA post ADD', err));
  });

exports.onUserFollowedChange = functions.firestore.document('followed/{userID}')
  .onUpdate((change, context) => {
    const before = Object.keys(change.before.data());
    const after = Object.keys(change.after.data());
    const newFollowers = after.filter(follower => !before.includes(follower));

    if (newFollowers.length === 0) {
      return false;
    }

    (async () => {
      let pushToken = '';
      try {
        const userDoc = await db.collection('users').doc(context.params.userID).get();
        console.log('user ===> ', userDoc.data());
        pushToken = userDoc.data().token;
      } catch (e) {
        console.error(e);
        return false;
      }

      const messages = [];
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return false;
      }

      // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
      for (const follower of newFollowers) {
        let followerName = '<someone>';
        try {
          const followerDoc = await db.collection('users').doc(follower).get();
          followerName = followerDoc.data().username;
        } catch (e) {
          console.error(e);
        }

        const data = {
          title: 'You have a new follower!',
          body: `@${followerName} is now following you.`,
        };

        messages.push({
          to: pushToken,
          sound: 'default',
          ...data,
          data,
        });
      }

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];
      // Send the chunks to the Expo push notification service. There are
      // different strategies you could use. A simple one is to send one chunk at a
      // time, which nicely spreads the load out over time:
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
          // NOTE: If a ticket contains an error code in ticket.details.error, you
          // must handle it appropriately. The error codes are listed in the Expo
          // documentation:
          // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        } catch (error) {
          console.error(error);
        }
      }

      return true;
    })();
  });

// listen for creating a user in Firestore
exports.addUserToAlgolia = functions.firestore.document('users/{userID}')
  .onCreate((snap, context) => {
    console.log('ADD USER EVENT IS', snap, context);
    const data = {
      objectID: context.params.userID,
      username: snap.data().username,
      name: snap.data().name,
      city: snap.data().city,
      avatar: snap.data().avatar,
    };
    return addToAlgolia(data, 'users')
      .then(res => console.log('SUCCESS ALGOLIA user ADD', res))
      .catch(err => console.log('ERROR ALGOLIA user ADD', err));
  });

// listen for editing a user in Firestore
exports.editUserToAlgolia = functions.firestore.document('users/{userID}')
  .onUpdate((change, context) => {
    console.log('EDIT USER EVENT IS', change, context);
    const data = {
      objectID: context.params.userID,
      username: change.after.data().username,
      name: change.after.data().name,
      city: change.after.data().city,
      avatar: change.after.data().avatar,
    };

    console.log('DATA in is', data);
    return editToAlgolia(data, 'users')
      .then(res => console.log('SUCCESS ALGOLIA user EDIT', res))
      .catch(err => console.log('ERROR ALGOLIA user EDIT', err));
  });

// listen for a user deletion in Firestore
exports.removeUserFromAlgolia = functions.firestore.document('users/{userID}')
  .onDelete((snap, context) => {
    const objectID = context.params.userID;
    return removeFromAlgolia(objectID, 'users')
      .then(res => console.log('SUCCESS ALGOLIA user ADD', res))
      .catch(err => console.log('ERROR ALGOLIA user ADD', err));
  });

// helper functions for create, edit and delete in Firestore to replicate this in Algolia
function addToAlgolia(object, indexName) {
  console.log('GETS IN addToAlgolia');
  console.log('object', object);
  console.log('indexName', indexName);
  const ALGOLIA_ID = functions.config().algolia.app_id;
  const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
  const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
  const index = client.initIndex(indexName);
  return new Promise((resolve, reject) => {
    index.addObject(object)
      .then((res) => { console.log('res GOOD', res); return resolve(res); })
      .catch((err) => { console.log('err BAD', err); reject(err); });
  });
}

function editToAlgolia(object, indexName) {
  const ALGOLIA_ID = functions.config().algolia.app_id;
  const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
  const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
  const index = client.initIndex(indexName);
  return new Promise((resolve, reject) => {
    index.saveObject(object)
      .then((res) => { console.log('res GOOD', res); return resolve(res); })
      .catch((err) => { console.log('err BAD', err); reject(err); });
  });
}

function removeFromAlgolia(objectID, indexName) {
  const ALGOLIA_ID = functions.config().algolia.app_id;
  const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
  const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
  const index = client.initIndex(indexName);
  return new Promise((resolve, reject) => {
    index.deleteObject(objectID)
      .then((res) => { console.log('res GOOD', res); return resolve(res); })
      .catch((err) => { console.log('err BAD', err); reject(err); });
  });
}

const parseHashtags = (str) => {
  const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
  const matches = new Set();
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(str))) {
    matches.add(match[1]);
  }

  return Array.from(matches);
};
