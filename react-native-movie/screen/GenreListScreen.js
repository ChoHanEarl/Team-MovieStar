import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import { fetchMoviesByGenre } from "../api/tmdb";

const GenreListScreen = ({route}) => {
  const {  genreId, genreName } = route.params || {};
    const navigation = useNavigation();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    useEffect(() => {
      const getMoviesByGenre = async () => {
        setLoading(true); // 데이터를 로딩할 때 로딩 상태를 true로 설정
        try {
          const moviesData = await fetchMoviesByGenre(genreId);
          setMovies(moviesData);
        } catch (error) {
          console.error("Error fetching movies by genre:", error);
        } finally {
          setLoading(false); // 데이터 로딩이 끝나면 로딩 상태를 false로 설정
        }
      };
      
      getMoviesByGenre(); // 컴포넌트가 렌더링될 때마다 장르별 영화 데이터를 가져옵니다.
    }, [genreId]);

  const handleNavigateToDetail = (movieId) => {
      navigation.navigate("Home", { 
        screen: "DetailScreen", // 중첩된 네비게이터 내의 'DetailScreen'을 찾음
        params: { id: movieId } 
      });
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
            keyExtractor={(item) => item.id ? item.id.toString() : item.title}
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
          margin: 5,
          alignItems: "center",
          justifyContent: "center"
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
          justifyContent: "space-between",
        },
      });

export default GenreListScreen;