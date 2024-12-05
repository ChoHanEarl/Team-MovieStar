import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, FlatList, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchPopularMovies, fetchNowPlayingMovies, fetchTopRatedMovies, searchMovies } from "../api/tmdb"; // API 함수 불러오기



const HomeScreen = () => {

  const navigation = useNavigation();

  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const popular = await fetchPopularMovies();
      const nowPlaying = await fetchNowPlayingMovies();
      const topRated = await fetchTopRatedMovies();

      setPopularMovies(popular);
      setNowPlayingMovies(nowPlaying);
      setTopRatedMovies(topRated);
    };

    fetchMovies();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query) {
      const searchResults = await searchMovies(query);
      setFilteredMovies(searchResults);
    } else {
      setFilteredMovies([]);
    }
  };

  const handleNavigateToDetail = (movieId) => {
    navigation.navigate("Detail", { id: movieId });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Movies..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {searchQuery && filteredMovies.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>검색 결과</Text>
          <FlatList
            data={filteredMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleNavigateToDetail(item.id)} style={styles.movieItem}>
                <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.movieImage} />
                <Text style={styles.movieTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>인기 영화</Text>
          <FlatList
            data={popularMovies}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleNavigateToDetail(item.id)} style={styles.movieItem}>
                <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.movieImage} />
                <Text style={styles.movieTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
          <Text style={styles.sectionTitle}>현재 상영 중</Text>
          <FlatList
            data={nowPlayingMovies}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleNavigateToDetail(item.id)} style={styles.movieItem}>
                <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.movieImage} />
                <Text style={styles.movieTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
          <Text style={styles.sectionTitle}>높은 평점 영화</Text>
          <FlatList
            data={topRatedMovies}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleNavigateToDetail(item.id)} style={styles.movieItem}>
                <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.movieImage} />
                <Text style={styles.movieTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 5,
  },
  movieItem: {
    marginRight: 10,
    width: 150,
    alignItems: "center",
  },
  movieImage: {
    width: 150,
    height: 225,
    borderRadius: 10,
  },
  movieTitle: {
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
  },
});

export default HomeScreen;
