import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/App.css";

// 영화 슬라이더 컴포넌트
const MovieSlider = ({ title, movies }) => {
  const sliderRef = useRef(); // 슬라이더 DOM 참조
  const navigate = useNavigate(); // 영화 상세 페이지 이동을 위한 네비게이션

  const handleScroll = (direction) => {
    // 슬라이더를 좌/우로 스크롤
    const slider = sliderRef.current;
    const scrollAmount = direction === "left" ? -300 : 300;
    slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleNavigate = (id) => {
    // 클릭한 영화의 상세 페이지로 이동
    navigate(`/movie/${id}`);
  };

  return (
    <div className="slider-section">
      <h2 className="slider-title">{title}</h2>
      <div className="slider-container">
        {/* 왼쪽 스크롤 버튼 */}
        <button className="slider-btn left" onClick={() => handleScroll("left")}>
          <span>&#8249;</span>
        </button>
        <div className="slider" ref={sliderRef}>
          {movies.map((movie) => (
            <div key={movie.id} className="slider-item" onClick={() => handleNavigate(movie.id)}>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} // 영화 포스터
                alt={movie.title}
                className="movie-poster"
              />
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
