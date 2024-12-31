import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import { fetchMoviesByGenre } from "../api/tmdb";

const GenreListScreen = ({route}) => {
  const {  genreId, genreName } = route.params || {};
    const navigation = useNavigation();
    const [movies, setMovies] = useState([]);

    useEffect(() => {
      const getMoviesByGenre = async () => {
        const moviesData = await fetchMoviesByGenre(genreId);
        setMovies(moviesData);
      };
      getMoviesByGenre();
    }, [genreId]);

    const handleNavigateToDetail = (movieId) => {
    navigation.navigate("DetailScreen", { id: movieId });
  };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.movieItem} onPress={() => handleNavigateToDetail(item.id)}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
            style={styles.moviePoster}
          />
          <Text style={styles.movieTitle}>{item.title}</Text>
        </TouchableOpacity>
      );
    
      return (
        <View style={styles.container}>

          <FlatList
            data={movies}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
          />
        </View>
      );
    };

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#121212',
          padding: 10,
        },
        genreTitle: {
          color: 'white',
          fontSize: 24,
          marginBottom: 10,
          fontWeight: 'bold',
        },
        movieItem: {
          flex: 1,
          margin: 0,
          alignItems: "center",
        },
        moviePoster: {
          width: "90%",
          height: 150,
          borderRadius: 8,
        },
        movieTitle: {
          color: 'white',
          marginLeft: 10,
          alignSelf: 'center',
          fontSize: 16,
          flex: 1,
        },
        columnWrapper: {
          justifyContent: "center",
        },
      });

export default GenreListScreen;