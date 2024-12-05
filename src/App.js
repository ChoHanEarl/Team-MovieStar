import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { fetchPopularMovies, fetchNowPlayingMovies, fetchTopRatedMovies, searchMovies } from "./api/tmdb.js";
import MovieDetail from "./components/MovieDetail";
import MovieSlider from "./components/MovieSlider.js";
import "./css/App.css";

// 최상단 추천 영화 섹션 (슬라이더 형태로 동작)
const TopRecommendation = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 추천 영화의 인덱스를 관리
  const navigate = useNavigate(); // 라우터 내비게이션을 위한 훅
//dddddddd
  useEffect(() => {
    if (!movies || movies.length === 0) return;

    // 5초마다 추천 영화 변경
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 인터벌 제거
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const handleClick = () => {
    // 현재 영화 상세 페이지로 이동
    navigate(`/movie/${movies[currentIndex].id}`);
  };

  const currentMovie = movies[currentIndex]; // 현재 표시할 영화 정보

  return (
    <div className="top-recommendation-container">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`top-recommendation ${
            index === currentIndex ? "active" : "inactive"
          }`}
          onClick={handleClick}
        >
          <img
            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} // 영화 배경 이미지
            alt={movie.title}
            className="top-recommendation-poster"
          />
          <div className="recommendation-info">
            <h2>{movie.title}</h2>
            <p>{movie.overview}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// 홈 페이지 컴포넌트
const HomePage = () => {
  const [popularMovies, setPopularMovies] = useState([]); // 인기 영화 데이터
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]); // 현재 상영 중 영화 데이터
  const [topRatedMovies, setTopRatedMovies] = useState([]); // 높은 평점 영화 데이터
  const [searchQuery, setSearchQuery] = useState(""); // 검색어
  const [filteredMovies, setFilteredMovies] = useState([]); // 검색 결과 영화 데이터

  useEffect(() => {
    const fetchMovies = async () => {
      // 영화 데이터 API 호출
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
      // 검색어가 입력되면 검색 API 호출
      const searchResults = await searchMovies(query);
      setFilteredMovies(searchResults);
    } else {
      setFilteredMovies([]);
    }
  };

  return (
    <div className="app">
      <h1>영화 추천</h1>
      {/* 검색 입력창 */}
      <input
        type="text"
        placeholder="Search Movies..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchQuery && filteredMovies.length > 0 ? (
        // 검색 결과 출력
        <MovieSlider title="검색 결과" movies={filteredMovies} />
      ) : (
        // 기본 영화 섹션 출력
        <>
          <TopRecommendation movies={popularMovies} />
          <MovieSlider title="인기 영화" movies={popularMovies} />
          <MovieSlider title="현재 상영 중" movies={nowPlayingMovies} />
          <MovieSlider title="높은 평점 영화" movies={topRatedMovies} />
        </>
      )}
    </div>
  );
};

// 앱의 루트 컴포넌트
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* 홈 페이지 라우트 */}
        <Route path="/movie/:id" element={<MovieDetail />} /> {/* 영화 상세 페이지 라우트 */}
      </Routes>
    </Router>
  );
};

export default App;
