import React from 'react';
import {
  StyleSheet, View, Text, Image, Dimensions, TextInput,
} from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { showMessage } from 'react-native-flash-message';
import UserPresenter from '../presenters/user_presenter';
import colors from '../colors';
import firebase from '../../firestore';

const { width } = Dimensions.get('window');
const db = firebase.firestore();

const styles = StyleSheet.create({
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
  description: {
    fontFamily: 'regular',
  },

  likeCount: {
    fontFamily: 'regular',
    color: colors.grey(1),
    fontSize: 11,
  },

  headerContainer: {
    width,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
  },
  userImageContainer: {
    marginRight: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  userImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  userNameText: {
    fontFamily: 'light',
    fontSize: 10,
  },
  timestampText: {
    textAlign: 'right',
    fontFamily: 'light',
    fontSize: 10,
    color: colors.grey(0.5),
    flex: 1,
  },

  actionsRow: {
    width,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  commentBoxContainer: {
    width,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  commentBox: {
    marginLeft: 10,
    flex: 1,
  },
});

const Post = ({ post, user }) => {
  const presenter = new UserPresenter(user);
  const ref = db.collection('posts').doc(post.key);
  const appUser = firebase.auth().currentUser.uid;

  const like = () => {
    ref.update({
      likedByUsers: firebase.firestore.FieldValue.arrayUnion(appUser),
    });
  };

  const unlike = () => {
    ref.update({
      likedByUsers: firebase.firestore.FieldValue.arrayRemove(appUser),
    });
  };

  const deletePost = (key) => {
    const postRef = db.collection('posts');
    const docRef = postRef.doc(key);
    docRef.delete().then(() => {
      showMessage({
        message: 'Post deleted!',
        description: 'Your post was deleted successfully.',
        type: 'success',
      });
    }).catch((error) => {
      console.error(error);
      showMessage({
        message: 'Error!',
        description: 'Could not delete post.',
        type: 'danger',
      });
    });
  };

  /*
  editPost = () => {
    let postRef = db.collection('posts');
    let docRef = postRef.doc(post.key);
    docRef.update({
    })
  }
  */

  let commentContent; let
    commentContentField;

  const comment = (text, el) => {
    if (!text) {
      showMessage({
        message: 'Sorry!',
        description: 'Cannot post comment without content.',
        type: 'warning',
      });
      return;
    }

    ref.update({
      commentedByUser: firebase.firestore.FieldValue.arrayUnion({
        who: appUser,
        content: text,
        timestamp: new Date(),
      }),
    })
      .then(() => {
        showMessage({
          message: 'Done!',
          type: 'success',
        });
        el.clear();
      })
      .catch(error => console.log(error));
  };

  const likesCount = post.likedByUsers.length;
  const liked = post.likedByUsers.includes(appUser);

  let formattedTimestamp;

  if (post.timestamp) {
    formattedTimestamp = moment(post.timestamp.toDate()).fromNow();
  }

  return (
    <View style={styles.imageContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.userImageContainer}>
          <Image
            style={styles.userImage}
            source={{
              uri: presenter.avatar,
            }}
          />
        </View>

        <Text style={styles.userNameText}>{presenter.name}</Text>

        <Text style={styles.timestampText}>{formattedTimestamp}</Text>
      </View>

      <Image style={styles.image} resizeMode="cover" source={{ uri: post.imageURL }} />
      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          {
            liked
              ? (
                <Button
                  buttonStyle={{ backgroundColor: 'transparent' }}
                  icon={(
                    <Icon
                      name="heart"
                      size={24}
                      color={colors.red(1)}
                    />
            )}
                  onPress={unlike}
                />
              )
              : (
                <Button
                  buttonStyle={{ backgroundColor: 'transparent' }}
                  icon={(
                    <Icon
                      name="heart-outline"
                      size={24}
                      color={colors.red(1)}
                    />
            )}
                  onPress={like}
                />
              )
          }
          <Text style={styles.likeCount}>
            {`${likesCount} likes`}
          </Text>
        </View>
        <View style={styles.leftActions}>
          <Button
            buttonStyle={{ backgroundColor: 'transparent' }}
            icon={(
              <Icon
                name="playlist-edit"
                size={24}
                color={colors.red(1)}
              />
            )}
            onPress={() => {
            }}
          />
          <Button
            buttonStyle={{ backgroundColor: 'transparent' }}
            icon={(
              <Icon
                name="delete"
                size={24}
                color={colors.red(1)}
              />
            )}
            onPress={() => deletePost(post.key)}
          />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.description}>
          {post.description}
        </Text>
      </View>
      <View style={styles.commentBoxContainer}>
        <Icon
          name="comment-text-multiple"
          size={24}
          color={colors.grey(0.5)}
        />
        <TextInput
          style={styles.commentBox}
          placeholder="Add comment..."
          ref={(el) => { commentContentField = el; }}
          onChangeText={(text) => { commentContent = text; }}
        />
        <Button
          buttonStyle={{ backgroundColor: 'transparent' }}
          titleStyle={{ color: colors.grey(0.7), fontFamily: 'light' }}
          title="Post"
          onPress={() => { comment(commentContent, commentContentField); }}
        />
      </View>
    </View>
  );
};

export default Post;
