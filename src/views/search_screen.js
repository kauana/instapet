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
  hits, hasMore, refine, navigation,
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
      }}
    />
  );
});

const SearchBox = connectSearchBox(({ refine, currentRefinement }) => (
  <SearchBar
    placeholder="Search a user..."
    onChangeText={text => refine(text)}
    value={currentRefinement}
    spellCheck={false}
    autoCorrect={false}
    autoCapitalize="none"
    containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }}
    inputContainerStyle={{ backgroundColor: 'white' }}
  />
));

class SearchScreen extends Component {
  static navigationOptions = () => ({ tabBarIcon: ({ tintColor }) => (<Icon name="magnify" size={24} color={tintColor} />) });

  render() {
    const { navigation } = this.props;

    return (
      <ScrollView style={styles.container}>
        <InstantSearch
          appId="FJ2KIO1VIS"
          apiKey="4b39aeba35b24341358ffdc2bc2400de"
          indexName="users"
        >
          <SearchBox />
          <SearchResults navigation={navigation} />
        </InstantSearch>
      </ScrollView>
    );
  }
}

export default SearchScreen;

// Source: https://community.algolia.com/react-instantsearch/Getting_started_React_native.html
