import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieDetails } from "../api/tmdb";
import { FaStar } from "react-icons/fa";
import moment from "moment";
import "../css/App.css";
import "../css/detail/Detail.css"
import "../css/detail/Review.css"
import "../css/detail/Modal.css"
import { AppContext } from "../context/AppContext";

// 별점 컴포넌트
const StarRating = ({ rating, setRating, size = 30, readOnly }) => (
  <div className="star-rating" style={{ cursor: "pointer" }}>
    {[...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        size={size}
        color={index < rating ? "gold" : "lightgray"}
        onClick={readOnly ? () => { } : () => setRating(index + 1)}
        style={readOnly ? { pointerEvents: "none", } : {}}
      />
    ))}
  </div>
);

// 리뷰 작성 폼 컴포넌트
const ReviewForm = ({ rate, setRate, review, setReview, addReview }) => (
  <div className="review-form">
    <h3>리뷰 작성</h3>
    <StarRating rating={rate} setRating={setRate} />
    <div className="review-input-container">
      <input
        className="review-input"
        placeholder="리뷰 내용을 입력해주세요"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <button className="review-submit-button" onClick={addReview}>
        올리기
      </button>
    </div>
  </div>
);

// 리뷰 아이템 컴포넌트
const ReviewItem = ({
  item,
  onEdit,
  onRemove,
  editable,
  editState,
  updateReview,
  cancelEdit,
  username
}) => (
  <li className="review-item">
    <div className="review-item-container">
      <span className="review-user">{item.user}</span>
      <StarRating rating={item.rate} size={15} readOnly />
      <span className="review-text">{item.review}</span>
      <span className="review-date">{item.date}</span>
      {username === item.user && (
        <div className="review-actions">
          <button className="review-edit-button" onClick={() => onEdit(item)}>
            수정
          </button>
          <button className="review-delete-button" onClick={() => onRemove(item.id)}>
            삭제
          </button>
        </div>
      )}
    </div>
    {editable && editState.id === item.id && (
      <div className="review-edit-form">
        <StarRating
          rating={editState.rate}
          setRating={(newRate) =>
            editState.setEditState((prev) => ({ ...prev, rate: newRate }))
          }
          size={15}
        />
        <input
          type="text"
          className="review-edit-input"
          placeholder="리뷰 내용을 입력해주세요"
          value={editState.review}
          onChange={(e) =>
            editState.setEditState((prev) => ({
              ...prev,
              review: e.target.value,
            }))
          }
        />
        <button className="review-update-button" onClick={updateReview}>
          수정하기
        </button>
        <button className="review-cancel-button" onClick={cancelEdit}>
          취소
        </button>
      </div>
    )}
  </li>
);

// 리뷰 리스트 컴포넌트
// const ReviewList = ({
//   reviews,
//   onEdit,
//   onRemove,
//   editable,
//   editState,
//   updateReview,
//   cancelEdit,
// }) => (
//   <ul className="review-list">
//     {reviews.map((item) => (
//       <ReviewItem
//         key={item.id}
//         item={item}
//         onEdit={onEdit}
//         onRemove={onRemove}
//         editable={editable}
//         editState={editState}
//         updateReview={updateReview}
//         cancelEdit={cancelEdit}
//       />
//     ))}
//   </ul>
// );

// 평균 평점 계산 함수
const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((acc, cur) => acc + cur.rate, 0);
  return (total / reviews.length).toFixed(2); // 소수점 2자리까지 표시
};

// 메인 MovieDetail 컴포넌트
const MovieDetail = ({ movie, onClose }) => {
  const [rate, setRate] = useState(5);
  const [review, setReview] = useState("");
  const [reviewList, setReviewList] = useState([]);
  const [editable, setEditable] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [editState, setEditState] = useState({ id: -1, rate: 5, review: "" });
  const { user } = useContext(AppContext)

  const averageRating = calculateAverageRating(reviewList);

  const addReview = () => {
    if(!user){
      alert("로그인한 유저만 리뷰를 등록 가능합니다")
      return;
    }
    const newReview = {
      id: reviewList.length + 1,
      user: user.username,
      rate,
      review,
      date: moment().format("MM/DD HH:mm"),
    };
    if (!review) {
      alert("리뷰 내용을 입력해주세요")
      return;
    }
    if (window.confirm("등록 하시겠습니까?")) {
      setReviewList((prev) => [newReview, ...prev]);
      setReview("");
      setRate(5);
      // 새 리뷰 추가 시 더보기 상태 초기화
      setVisibleReviews(3);
    }
  };

  const handleRemove = (id) => {
    if (window.confirm("삭제 하시겠습니까?")) {
      setReviewList((prev) => prev.filter((item) => item.id !== id));
      // 삭제 후 더보기 상태 조정
      setVisibleReviews(Math.min(visibleReviews, reviewList.length - 1));
    }
  };

  const handleEdit = (item) => {
    setEditable(true);
    setEditState({ id: item.id, rate: item.rate, review: item.review });
  };

  const updateReview = () => {
    if (window.confirm("수정 하시겠습니까?")) {
      setReviewList((prev) =>
        prev.map((item) =>
          item.id === editState.id
            ? { ...item, rate: editState.rate, review: editState.review }
            : item
        )
      );
      setEditable(false);
      setEditState({ id: -1, rate: 5, review: "" });
    }
  };

  const cancelEdit = () => {
    setEditable(false);
    setEditState({ id: -1, rate: 5, review: "" });
  };

  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 3);
  };

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="modal-movie-poster"
        />
        <div className="modal-movie-details">
          <h1>{movie.title}</h1>
          <p>{movie.overview}</p>
          <p><strong>개봉일:</strong> {movie.release_date}</p>
          <p><strong>평점:</strong> {movie.vote_average}</p>

          {/* 리뷰 작성 폼 */}
          <ReviewForm
            rate={rate}
            setRate={setRate}
            review={review}
            setReview={setReview}
            addReview={addReview}
          />

          {/* 사용자 리뷰 */}
          <h3>사용자 리뷰</h3>
          <strong>유저 평점: </strong> {averageRating}

          {reviewList.length === 0 ? (
            <p>등록된 리뷰가 없습니다.</p>
          ) : (
            <>
              <ul className="review-list">
                {reviewList.slice(0, visibleReviews).map((item) => (
                  <ReviewItem
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                    editable={editable}
                    editState={{
                      ...editState,
                      setEditState,
                    }}
                    updateReview={updateReview}
                    cancelEdit={cancelEdit}
                    username={user.username}
                  />
                ))}
              </ul>

              {visibleReviews < reviewList.length && (
                <div className="load-more-container">
                  <button
                    className="load-more-button"
                    onClick={loadMoreReviews}
                  >
                    더보기 ({visibleReviews} / {reviewList.length})
                  </button>
                </div>
              )}
            </>
          )}

          {/* 하단 여백 확보 */}
          <div style={{ height: '20px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
