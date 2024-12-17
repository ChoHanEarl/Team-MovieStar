import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

import "../css/main/Slider.css"

const MovieSlider = ({ title, movies, onMovieSelect }) => {
  // 슬라이더 참조를 위한 ref 생성
  const sliderRef = useRef();
  const navigate = useNavigate();

  // 슬라이더 스크롤 핸들러 - 좌우 스크롤 구현
  const handleScroll = (direction) => {
    const slider = sliderRef.current;
    // 스크롤 방향에 따라 스크롤 양 결정
    const scrollAmount = direction === "left" ? -300 : 300;
    // 부드러운 스크롤 애니메이션
    slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // 영화 클릭 시 동작하는 핸들러
  const handleMovieClick = (movie) => {
    // onMovieSelect 콜백이 있으면 영화 정보 전달 (모달용)
    if (onMovieSelect) {
      onMovieSelect(movie);
    } else {
      // 없으면 기본 라우팅 방식으로 이동
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <div className="slider-section">
      {/* 슬라이더 제목 */}
      <h2 className="slider-title">{title}</h2>
      <div className="slider-container">
        {/* 왼쪽 스크롤 버튼 */}
        <button className="slider-btn left" onClick={() => handleScroll("left")}>
          <span>&#8249;</span>
        </button>
        
        {/* 영화 포스터 슬라이더 */}
        <div className="slider" ref={sliderRef}>
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="slider-item"
              // 영화 클릭 시 상세 페이지/모달 오픈
              onClick={() => handleMovieClick(movie)}
            >
              {/* 영화 포스터 이미지 */}
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
              />
              {/* 영화 제목 */}
              <h3>{movie.title}</h3>
            </div>
          ))}
        </div>
        
        {/* 오른쪽 스크롤 버튼 */}
        <button className="slider-btn right" onClick={() => handleScroll("right")}>
          <span>&#8250;</span>
        </button>
      </div>
    </div>
  );
};

export default MovieSlider;