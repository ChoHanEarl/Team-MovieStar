import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPopularMovies, fetchNowPlayingMovies, fetchTopRatedMovies, searchMovies, fetchGenres, fetchMoviesByGenre } from "../api/tmdb.js";
import { AppContext } from "../context/AppContext.js";
import MovieDetail from "../components/MovieDetail.js";
import MovieSlider from "../components/MovieSlider.js";
import logo from "../logo/logo.png";

import '../css/main/MyPage.css';
import "../css/main/Header.css"
import "../css/main/TopRecommendation.css"
import "../css/main/GenreList.css"


// 최상단 추천 영화 섹션 - 자동으로 슬라이딩되는 배너 컴포넌트
const TopRecommendation = ({ movies, onMovieSelect }) => {
  // 현재 보여줄 영화의 인덱스 상태 관리
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 영화 데이터가 없으면 종료
    if (!movies || movies.length === 0) return;

    // 5초마다 다음 추천 영화로 자동 전환
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 5000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="top-recommendation-container">
      {/* 모든 추천 영화를 렌더링하지만 현재 인덱스의 영화만 활성화 */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`top-recommendation ${
            index === currentIndex ? "active" : "inactive"
          }`}
          onClick={() => onMovieSelect(movie)} // 영화 클릭 시 모달 오픈
        >
          {/* 영화 배경 이미지 */}
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
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

const HomePage = () => {
  const { user, setUser } = useContext(AppContext);
  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState({});
  const [error, setError] = useState(null);
  const sectionsRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    // 영화 데이터 초기 로딩
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

  // 장르 목록 가져오기
  useEffect(() => {
    const loadGenres = async () => {
      const genreList = await fetchGenres()
      setGenres(genreList)
      
      // 각 장르의 영화 가져오기
      genreList.forEach(async (genre) => {
        const moviesByGenre = await fetchMoviesByGenre(genre.id)
        setMovies((prevMovies) => ({
          ...prevMovies,
          [genre.id]: moviesByGenre
        }))
      })
    }

    loadGenres()
  }, [])

  useEffect(() => {
    // 각 장르에 대해 영화 목록을 자동으로 로딩
    if (genres.length > 0) {
      genres.forEach((genre) => {
        fetchMoviesByGenre(genre.id).then((movies) => {
          setMovies((prevMovies) => ({
            ...prevMovies,
            [genre.id]: movies, // 장르별로 영화 리스트 저장
          }));
        });
      });
    }
  }, [genres]);

  const handleNavClick = (genreId) => {
    fetchMoviesByGenre(genreId).then((movies) => {
      setMovies((prevMovies) => ({
        ...prevMovies,
        [genreId]: movies, // 선택된 장르의 영화 데이터를 업데이트
      }));
    });

    const section = sectionsRef.current[genreId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query) {
      const searchResults = await searchMovies(query);
      setFilteredMovies(searchResults);
    } else {
      setFilteredMovies([]);
    }
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseMovieDetail = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="main-page">
      <div className="header-navbar">
        <header className="main-header">
          <img src={logo} className="main-logo" onClick={() => navigate("/home")} />
          <input
            type="text"
            placeholder="Search Movies..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          {user ? (
            <>
              <button onClick={() => navigate("/mypage")}>마이페이지</button>
              <button onClick={() => { localStorage.removeItem("token"); setUser(null); navigate("/login"); }}>로그아웃</button>
            </>
          ) : (
            <button onClick={() => navigate("/login")}>로그인</button>
          )}
        </header>
        <nav className="nav-bar">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleNavClick(genre.id)}
              className="nav-item"
            >
              {genre.name}
            </button>
          ))}
        </nav>
      </div>

      {searchQuery && filteredMovies.length > 0 ? (
        <MovieSlider title="검색 결과" movies={filteredMovies} onMovieSelect={handleMovieSelect} />
      ) : (
        <>
          {/* 추천 섹션 및 다양한 카테고리 영화 슬라이더 */}
          <TopRecommendation 
            movies={popularMovies} 
            onMovieSelect={handleMovieSelect} 
          />
          <div className="movie-list">
            <MovieSlider title="인기 영화" movies={popularMovies} onMovieSelect={handleMovieSelect} />
            <MovieSlider title="현재 상영 중" movies={nowPlayingMovies} onMovieSelect={handleMovieSelect} />
            <MovieSlider title="높은 평점 영화" movies={topRatedMovies} onMovieSelect={handleMovieSelect} />
            <div className="genre-movie-list">
              {genres.map((genre) => (
                <div key={genre.id} ref={(el) => (sectionsRef.current[genre.id] = el)}>
                  <MovieSlider
                    title={genre.name}
                    movies={movies[genre.id] || []}
                    onMovieSelect={handleMovieSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedMovie && <MovieDetail movie={selectedMovie} onClose={handleCloseMovieDetail} />}
    </div>
  );
};

export default HomePage;
