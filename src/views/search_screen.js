import React, { Component } from 'react';
import { SearchBar } from 'react-native-elements';
import {
  ScrollView, StyleSheet, View, Text, FlatList, Image, TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  InstantSearch, connectInfiniteHits, connectSearchBox,
} from 'react-instantsearch-native';
import colors from '../colors';
import UserPresenter from '../presenters/user_presenter';
import Post from './post';
import firebase from '../../firestore';

const db = firebase.firestore();

class PostLoader extends Component {
  constructor(props) {
    super(props);

    this.cancelled = false;

    this.state = {
      post: null,
      user: null,
    };
  }

  componentDidMount() {
    const { postID } = this.props;
    console.log(postID);
    db.collection('posts').doc(postID).get().then((postSnapshot) => {
      const post = {
        key: postID,
        ...postSnapshot.data(),
      };

      if (!post.userID) { return; }

      db.collection('users').doc(post.userID).get().then((userSnapshot) => {
        const user = userSnapshot.data();
        if (this.cancelled) { return; }
        this.setState({ post, user });
      })
        .catch(error => console.error(error));
    })
      .catch(error => console.error(error));
  }

  componentWillUnmount() {
    this.cancelled = true;
  }

  render() {
    const { navigation } = this.props;
    const { post, user } = this.state;

    if (post && user) {
      return <Post post={post} user={user} navigation={navigation} />;
    }

    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userImage: {
    borderRadius: 40,
    height: 80,
    width: 80,
    marginRight: 10,
  },
  searchResult: {
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey(0.1),
  },
  userNameRow: {
    marginBottom: 10,
  },
  userNameText: {
    color: colors.grey(1),
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'bold',
  },
  cityRow: {
    marginBottom: 10,
  },
  cityText: {
    color: colors.grey(1),
    fontSize: 12,
    fontFamily: 'light',
  },
});

const SearchResults = connectInfiniteHits(({
  hits, hasMore, refine, navigation, searchIndex,
}) => {
  /* if there are still results, you can
  call the refine function to load more */
  const onEndReached = () => {
    if (hasMore) {
      refine();
    }
  };

  return (
    <FlatList
      data={hits}
      onEndReached={onEndReached}
      keyExtractor={item => item.objectID}
      renderItem={({ item }) => {
        const presenter = new UserPresenter(item);

        if (searchIndex === 'users') {
          return (
            <TouchableHighlight
              underlayColor={colors.grey(0.1)}
              onPress={
              () => navigation.push('UserProfile', { userID: item.objectID })
            }
            >
              <View style={styles.searchResult}>
                <Image
                  style={styles.userImage}
                  source={{ uri: presenter.avatar }}
                />
                <View style={{ flexDirection: 'column' }}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userNameText}>{presenter.name}</Text>
                  </View>
                  {
              item.city && item.city.length > 0
                ? (
                  <View style={styles.cityRow}>
                    <Text style={styles.cityText}>{`Location: ${item.city}`}</Text>
                  </View>
                )
                : null
            }
                </View>
              </View>
            </TouchableHighlight>
          );
        } if (searchIndex === 'posts') {
          return <PostLoader postID={item.objectID} navigation={navigation} />;
        }

        return null;
      }}
    />
  );
});

const SearchBox = connectSearchBox(({
  refine, currentRefinement, onChangeText,
}) => (
  <SearchBar
    placeholder="Search user or hashtag..."
    onChangeText={(text) => {
      refine(text);
      onChangeText(text);
    }}
    value={currentRefinement}
    spellCheck={false}
    autoCorrect={false}
    autoCapitalize="none"
    containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }}
    inputContainerStyle={{ backgroundColor: 'white' }}
  />
));

class SearchScreen extends Component {
  static navigationOptions = () => ({
    tabBarIcon: ({ tintColor }) => (<Icon name="magnify" size={24} color={tintColor} />),
    title: 'InstaPet',
    headerTintColor: colors.red(1),
    headerStyle: {
      backgroundColor: colors.green1(1),
    },
    headerTitleStyle: {
      color: 'white',
    },
  });

  constructor(props) {
    super(props);
    const { navigation } = this.props;

    this.state = {
      text: navigation.getParam('searchString', ''),
    };
  }

  searchIndex = () => {
    const { text } = this.state;
    return text.startsWith('#') ? 'posts' : 'users';
  }

  render() {
    const { navigation } = this.props;
    const { text } = this.state;

    return (
      <ScrollView style={styles.container}>
        <InstantSearch
          appId="FJ2KIO1VIS"
          apiKey="4b39aeba35b24341358ffdc2bc2400de"
          indexName={this.searchIndex()}
        >
          <SearchBox
            defaultRefinement={text}
            onChangeText={newText => this.setState({ text: newText })}
          />
          <SearchResults navigation={navigation} searchIndex={this.searchIndex()} />
        </InstantSearch>
      </ScrollView>
    );
  }
}

export default SearchScreen;

// Source: https://community.algolia.com/react-instantsearch/Getting_started_React_native.html
