import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieDetails } from "../api/tmdb";
import {Ionicons} from "@expo/vector-icons"
import moment from "moment";
import "../css/App.css";

// 영화 상세 정보 페이지
const MovieDetail = () => {
  const { id } = useParams(); // URL에서 영화 ID 가져오기
  const [movie, setMovie] = useState(null); // 영화 상세 데이터 상태
  const [rate, setRate] = useState('5')
  const [review, setReview] = useState("")
  const [reviewList, setReviewList] = useState([])
  const [editable, setEditable] = useState(false)
  const [editId, setEditId] = useState(-1)
  const [editedReview, setEditedReview] = useState("")

  const navigate = useNavigate(); // 뒤로가기 버튼 처리를 위한 네비게이션

  const buttonHandle = () => {
    const newReview = {
      id: reviewList.length + 1,
      user: "유저 이름",
      rate: Number(rate),
      review: review,
      date: moment().format('MM/DD HH:mm')
    }
    setReviewList(prev => [newReview, ...prev])
    setReview("")
  }

  const handleRemove = (id) => {
    const newList = reviewList.filter((item) => item.id !== id)
    setReviewList(newList)
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setEditable(true)
    setEditedReview(item.review)
    setRate("5")
    console.log(editId + "/" + editable)
  }



  useEffect(() => {
    const getMovieDetails = async () => {
      const movieDetails = await fetchMovieDetails(id); // API로 영화 상세 정보 가져오기
      setMovie(movieDetails);
    };

    getMovieDetails();
  }, [id]);

  if (!movie) return <div>Loading...</div>; // 데이터 로딩 중 표시

  return (
    <div className="movie-detail" style={{
      background: `linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), 
      url(https://image.tmdb.org/t/p/original/${movie.backdrop_path})`,
      backgroundSize: 'cover',
    }}>
      <button
        onClick={() => navigate(-1)} // 이전 페이지로 이동
        className="back-button">
        ← 뒤로 가기
      </button>
      <div className="detail-header">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div>
          <h1>{movie.title}</h1>
          <p>{movie.overview}</p>
          <p><strong>Release Date:</strong> {movie.release_date}</p>
          <p><strong>Rating:</strong> {movie.vote_average}</p>
        </div>
      </div>
      <div>
        <p><strong>리뷰 작성</strong></p>
        <p>유저 평점: {reviewList.length === 0 ? 0 : (reviewList.reduce((acc, cur) => { return acc + cur.rate }, 0) / reviewList.length).toFixed(2)}</p>
        <select name="rate" onChange={(e) => setRate(e.target.value)}>
          <option value='5'>★★★★★</option>
          <option value='4'>★★★★☆</option>
          <option value='3'>★★★☆☆</option>
          <option value='2'>★★☆☆☆</option>
          <option value='1'>★☆☆☆☆</option>
        </select>
        <input placeholder="리뷰의 내용을 입력해주세요" value={review} onChange={(e) => setReview(e.target.value)} />
        <button onClick={buttonHandle}>올리기</button>
      </div>
      <div className="detail-review-list">
        <ul>
          {
            reviewList.map(item =>
              <li key={item.id} className="review-item">
                <div className="review-item-container">
                  <span>{item.user}</span>
                  <span>{item.rate}</span>
                  <span>{item.review}</span>
                  <span>{item.date}</span>
                  <button onClick={() => handleEdit(item)}>수정</button>
                  <button onClick={() => handleRemove(item.id)}>삭제</button>
                </div>
                {editable && item.id == editId &&
                (<div className="review-item-edit">
                  <span></span>
                  <select name="rate" onChange={(e) => setRate(e.target.value)}>
                    <option value='5'>★★★★★</option>
                    <option value='4'>★★★★☆</option>
                    <option value='3'>★★★☆☆</option>
                    <option value='2'>★★☆☆☆</option>
                    <option value='1'>★☆☆☆☆</option>
                  </select>
                  <input placeholder="리뷰의 내용을 입력해주세요" value={editedReview} onChange={(e) => setEditedReview(e.target.value)} />
                  <span></span>
                  <button onClick ={() => {
                    item.review = editedReview
                    item.rate = rate
                    setEditable(false)
                  }}>수정하기</button>
                  <button onClick ={() => setEditable(false)}>취소</button>
                </div>)}
              </li>
            )
          }
        </ul>
      </div>
    </div>
  );
};

export default MovieDetail;
