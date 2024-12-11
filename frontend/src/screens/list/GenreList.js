import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../css/main/GenreList.css"


const GenreList = () => {
  const [genres, setGenres] = useState([]); // 장르 데이터
  const [movies, setMovies] = useState({}); // 장르별 영화 데이터 (객체 형태)
  const [error, setError] = useState(null);
  const sectionsRef = useRef({}); // 각 섹션의 ref 저장

  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  const instance = axios.create({
    baseURL: BASE_URL,
    params: {
      api_key: API_KEY,
      language: "ko-KR",
    },
  });

  // 장르 목록 가져오기
  const fetchGenres = async () => {
    try {
      const response = await instance.get("/genre/movie/list");
      setGenres(response.data.genres);
    } catch (error) {
      setError("장르 목록을 가져오는 중 문제가 발생했습니다.");
    }
  };

  // 특정 장르의 영화 가져오기
  const fetchMoviesByGenre = async (genreId) => {
    try {
      const response = await instance.get("/discover/movie", {
        params: {
          with_genres: genreId,
          sort_by: "popularity.desc",
        },
      });

      setMovies((prevMovies) => ({
        ...prevMovies,
        [genreId]: response.data.results,
      })); // 기존 영화 데이터와 병합
    } catch (error) {
      setError("영화를 가져오는 중 문제가 발생했습니다.");
    }
  };

  // 네비게이션 클릭 핸들러
  const handleNavClick = (genreId) => {
    fetchMoviesByGenre(genreId); // 영화 데이터 로드
    const section = sectionsRef.current[genreId]; // 해당 섹션의 ref 가져오기
    if (section) {
      section.scrollIntoView({ behavior: "smooth" }); // 스크롤 이동
    }
  };

  useEffect(() => {
    fetchGenres(); // 장르 목록 가져오기
  }, []);

  return (
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
  
      {/* 콘텐츠 */}
      <div className="content">
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
      </div>
    </div>
  );
};


export default GenreList;

