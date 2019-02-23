import React, { Component } from 'react';
import {
  StyleSheet, View, Text, FlatList, Image, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  InstantSearch, connectInfiniteHits, connectSearchBox, connectHighlight,
} from 'react-instantsearch-native';
import colors from '../colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchInput: {
    height: 60,
    borderWidth: 1,
    padding: 10,
    margin: 10,
    flex: 1,
  },
});

const Highlight = connectHighlight(
  ({
    highlight, attribute, hit,
  }) => {
    const parsedHit = highlight({
      attribute,
      hit,
      highlightProperty: '_highlightResult',
    });
    const highlightedHit = parsedHit.map((part, idx) => {
      if (part.isHighlighted) {
        return (
          <Text key={idx} style={{ backgroundColor: colors.green1(1) }}>
            {part.value}
          </Text>
        );
      }
      return part.value;
    });
    return <Text>{highlightedHit}</Text>;
  },
);

const SearchResults = connectInfiniteHits(({ hits, hasMore, refine }) => {
  /* if there are still results, you can
  call the refine function to load more */
  const onEndReached = () => {
    if (hasMore) {
      refine();
    }
  };

  console.log('Got results:', hits);

  return (
    <FlatList
      data={hits}
      onEndReached={onEndReached}
      keyExtractor={item => item.objectID}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {
          // <Image
          //   style={{ height: 100, width: 100 }}
          //   source={{ uri: item.image }}
          // />
          }
          <View style={{ flex: 1 }}>
            <Text>
              <Highlight attribute="username" hit={item} />
            </Text>
            <Text>
              <Highlight attribute="name" hit={item} />
            </Text>
          </View>
        </View>
      )}
    />
  );
});

const SearchBox = connectSearchBox(({ refine, currentRefinement }) => (
  <TextInput
    style={styles.searchInput}
    onChangeText={text => refine(text)}
    value={currentRefinement}
    placeholder="Search a user..."
    clearButtonMode="always"
    spellCheck={false}
    autoCorrect={false}
    autoCapitalize="none"
  />
));

class SearchScreen extends Component {
  static navigationOptions = () => ({ tabBarIcon: ({ tintColor }) => (<Icon name="magnify" size={24} color={tintColor} />) });

  render() {
    return (
      <View style={styles.container}>
        <InstantSearch
          appId="FJ2KIO1VIS"
          apiKey="4b39aeba35b24341358ffdc2bc2400de"
          indexName="users"
        >
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <SearchBox />
          </View>
          <SearchResults />
        </InstantSearch>
      </View>
    );
  }
}

export default SearchScreen;
