import axios from "axios";
import { API_BASE_URL } from "./api-config";



// 인기 영화 데이터를 가져오는 함수
export const fetchPopularMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/popular`);

    return response.data.data;  // 데이터를 반환
  } catch (error) {
    console.error("Error searching for movies:", error);
    return [];  // 오류 발생 시 빈 배열 반환
  }
};

// 영화 검색 함수
export const searchMovies = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/search?query=` + query);
    if(!response.data.data){
      return []
    }
    return response.data.data;  // 데이터를 반환
  } catch (error) {
    console.error("Error searching for movies:", error);
    return [];  // 오류 발생 시 빈 배열 반환
  }
};

// 현재 상영 중인 영화 데이터를 가져오는 함수
export const fetchNowPlayingMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/now_playing`);

    return response.data.data;  // 데이터를 반환
  } catch (error) {
    console.error("Error searching for movies:", error);
    return [];  // 오류 발생 시 빈 배열 반환
  }
};

// 높은 평점 영화 데이터를 가져오는 함수
export const fetchTopRatedMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/top_rated`);

    return response.data.data;  // 데이터를 반환
  } catch (error) {
    console.error("Error searching for movies:", error);
    return [];  // 오류 발생 시 빈 배열 반환
  }
};

// 장르 목록을 가져오는 함수
export const fetchGenres = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/themes`);

    return response.data.data;  // 데이터를 반환
  } catch (error) {
    console.error("Error fetching genres:", error); 
    return [];  // 오류 발생 시 빈 배열 반환
  }
};

// 영화 장르별로 데이터를 가져오는 함수
export const fetchMoviesByGenre = async (themeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/theme/` + themeId);

    return response.data.data;  // 데이터를 반환
  } catch (error) {
    console.error("Error fetching movies by genre:", error); 
    return [];  // 오류 발생 시 빈 배열 반환
  }
}
