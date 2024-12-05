import axios from 'axios';

const API_KEY = '17601d518dbaec78cb1800616a38ad67'; // TMDB API 키
const API_URL = 'https://api.themoviedb.org/3'; // TMDB API 기본 URL

// Axios 인스턴스 생성
const instance = axios.create({
  baseURL: API_URL,
  params: {
    api_key: API_KEY,
    language: 'ko-KR', // 언어 설정
  },
});

// 인기 영화 데이터를 가져오는 함수
export const fetchPopularMovies = async () => {
  try {
    const response = await instance.get('/movie/popular'); // 인기 영화 엔드포인트 호출
    return response.data.results; // 영화 데이터 반환
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

// 영화 검색 함수
export const searchMovies = async (query) => {
  try {
    const response = await instance.get('/search/movie', {
      params: {
        query, // 검색어를 파라미터로 추가
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching for movies:', error);
    return [];
  }
};

// 영화 상세 정보 함수
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await instance.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return {};
  }
};

// 현재 상영 중인 영화 데이터를 가져오는 함수
export const fetchNowPlayingMovies = async () => {
  try {
    const response = await instance.get('/movie/now_playing');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    return [];
  }
};

// 높은 평점 영화 데이터를 가져오는 함수
export const fetchTopRatedMovies = async () => {
  try {
    const response = await instance.get('/movie/top_rated');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

//출연진 목록을 가져오는 함수
export const fetchMovieCredits = async (movieId) => {
  try {
    const response = await instance.get(`/movie/${movieId}/credits`);
    console.log("API 응답 데이터:", response.data); // 응답 데이터 구조 확인
    return response.data; // cast 배열을 가져오는 대신 전체 데이터를 반환
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    return { cast: [] }; // 오류 발생 시 기본값 설정
  }
};