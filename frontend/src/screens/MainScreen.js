import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPopularMovies, fetchNowPlayingMovies, fetchTopRatedMovies, searchMovies } from "../api/tmdb.js";
import { AppContext } from "../context/AppContext.js";
import MovieDetail from "../components/MovieDetail.js";
import MovieSlider from "../components/MovieSlider.js";
import logo from "../logo/logo.png"
import axios from "axios";

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
  
  // 메인 홈페이지 컴포넌트
  const HomePage = () => {
    // 유저 관리 컨텍스트
    const { user, setUser } = useContext(AppContext)

    // 다양한 영화 리스트 상태 관리
    const [popularMovies, setPopularMovies] = useState([]); 
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]); 
    const [topRatedMovies, setTopRatedMovies] = useState([]); 
    
    // 검색 관련 상태 관리
    const [searchQuery, setSearchQuery] = useState(""); 
    const [filteredMovies, setFilteredMovies] = useState([]); 
    
    // 선택된 영화 모달 상태 관리
    const [selectedMovie, setSelectedMovie] = useState(null);

    // 장르 관련 상태 관리
    const [genres, setGenres] = useState([]);
    const [movies, setMovies] = useState({});
    const [error, setError] = useState(null);
    const sectionsRef = useRef({});

    // TMDB
    const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
    const BASE_URL = "https://api.themoviedb.org/3";

    const fetchMoviesByGenre = async (genreId) => {
      try {
        const response = await axios.get(`${BASE_URL}/discover/movie`, {
          params: {
            api_key: API_KEY,
            with_genres: genreId,
            language: "ko-KR",
            sort_by: "popularity.desc",
          },
        });
        setMovies((prevMovies) => ({
          ...prevMovies,
          [genreId]: response.data.results,
        }));
      } catch (error) {
        console.error("Error fetching movies by genre:", error);
      }
    };
  
    const handleNavClick = (genreId) => {
      fetchMoviesByGenre(genreId);
      const section = sectionsRef.current[genreId];
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    };

    // 화면 이동 함수 정의
    const navigate = useNavigate()

    // 로고 클릭 시 메인화면 띄우기(추후 마이페이지에서 활용)
    const handleLogoClick = () => {
      navigate("/home")
    }

    // 로그인 버튼 클릭 시
    const navigateToLoginScreen = () => {
        navigate("/login") // LoginScreen으로 이동
    }

    // 로그아웃 버튼 클릭 시
    const handleLogout = () => {
        localStorage.removeItem("token")
        setUser(null) // 사용자 로그아웃 처리
        navigate("/login")
    }

    // 마이페이지로 이동하는 함수
    const navigateToMyPage = () => {
        navigate("/mypage")
    }
  
    // 컴포넌트 마운트 시 영화 데이터 초기 로딩
    useEffect(() => {
      const fetchMovies = async () => {
        // 다양한 카테고리의 영화 데이터 fetch
        const popular = await fetchPopularMovies();
        const nowPlaying = await fetchNowPlayingMovies();
        const topRated = await fetchTopRatedMovies();
  
        // 상태 업데이트
        setPopularMovies(popular);
        setNowPlayingMovies(nowPlaying);
        setTopRatedMovies(topRated);
      };
      
      fetchMovies();
    }, []);

    const instance = axios.create({
      baseURL: BASE_URL,
      params: {
        api_key: API_KEY,
        language: "ko-KR",
      },
    });
  
    const fetchGenres = async () => {
      try {
        const response = await instance.get("/genre/movie/list");
        setGenres(response.data.genres);
      } catch (error) {
        setError("장르 목록을 가져오는 중 문제가 발생했습니다.");
      }
    };

    useEffect(() => {
      // 장르 목록을 가져온 후 각 장르에 대해 영화 목록을 자동으로 로딩
      if (genres.length > 0) {
        genres.forEach((genre) => {
          fetchMoviesByGenre(genre.id);
        });
      }
    }, [genres]); // genres가 변경될 때마다 실행
  
    useEffect(() => {
      fetchGenres();
    }, []);

    // 영화 검색 핸들러
    const handleSearch = async (query) => {
      setSearchQuery(query);
      if (query) {
        // 검색어가 있으면 영화 검색 API 호출
        const searchResults = await searchMovies(query);
        setFilteredMovies(searchResults);
      } else {
        // 검색어가 없으면 검색 결과 초기화
        setFilteredMovies([]);
      }
    };
  
    // 영화 선택 시 모달 오픈 핸들러
    const handleMovieSelect = (movie) => {
      setSelectedMovie(movie);
    };
  
    // 영화 모달 닫기 핸들러
    const handleCloseMovieDetail = () => {
      setSelectedMovie(null);
    };
  
    return (
      <div className="main-page">
        <div >
        <header className="main-header">
          <img src={logo} className="main-logo" onClick={handleLogoClick}/>
            {/* 영화 검색 입력창 */}
            <input
            type="text"
            placeholder="Search Movies..."
            onChange={(e) => handleSearch(e.target.value)}
            />
            {/* 로그인, 로그아웃 버튼 */}
            { user ? (
              <>
                <button onClick={navigateToMyPage}>마이페이지</button>
                <button onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
                <button onClick={navigateToLoginScreen}>로그인</button>
            )}
        </header>
        <div>
          {/* 네비게이션 바 */}
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
        </div>

        {/* 검색 결과 또는 기본 영화 리스트 조건부 렌더링 */}
        {searchQuery && filteredMovies.length > 0 ? (
          <MovieSlider 
            title="검색 결과" 
            movies={filteredMovies} 
            onMovieSelect={handleMovieSelect} 
          />
        ) : (
          <>
            {/* 추천 섹션 및 다양한 카테고리 영화 슬라이더 */}
            <TopRecommendation 
              movies={popularMovies} 
              onMovieSelect={handleMovieSelect} 
            />
            <MovieSlider 
              title="인기 영화" 
              movies={popularMovies} 
              onMovieSelect={handleMovieSelect} 
            />
            <MovieSlider 
              title="현재 상영 중" 
              movies={nowPlayingMovies} 
              onMovieSelect={handleMovieSelect} 
            />
            <MovieSlider 
              title="높은 평점 영화" 
              movies={topRatedMovies} 
              onMovieSelect={handleMovieSelect} 
            />
            {/* 장르별 영화 리스트 */}
          <div >
            {genres.map((genre) => (
              <div 
                key={genre.id} 
                ref={(el) => (sectionsRef.current[genre.id] = el)}
              >
                <MovieSlider
                  title={genre.name}
                  movies={movies[genre.id] || []}
                  onMovieSelect={handleMovieSelect}
                />
              </div>
            ))}
          </div>
            
            {/* 콘텐츠 */}
            {/* <div className="content">
            {genres.map((genre) => (
              <div
                key={genre.id}
                ref={(el) => (sectionsRef.current[genre.id] = el)}
                className="genre-section"
              >
                <h2>{genre.name}</h2>
                <div className="movies">
                  {movies[genre.id]?.map((movie) => (
                    <div key={movie.id} className="movie-card">
                      <h3>{movie.title}</h3>
                      <p>{movie.overview}</p>
                      <img
                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                        alt={movie.title}
                      />
                    </div>
                  )) || <p>영화를 로드 중입니다...</p>}
                </div>
              </div>
            ))}
            </div> */}
          </>
        )}
  
        {/* 영화 선택 시 모달 렌더링 */}
        {selectedMovie && (
          <MovieDetail 
            movie={selectedMovie} 
            onClose={handleCloseMovieDetail} 
          />
        )}
      </div>
    );
  };

export default HomePage