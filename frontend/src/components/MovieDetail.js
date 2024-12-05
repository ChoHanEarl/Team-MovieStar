import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieDetails, fetchMovieCredits } from "../api/tmdb";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import moment from "moment";
import "../css/detail/Detail.css"
import "../css/detail/Review.css"
import "../css/detail/Modal.css"
import { AppContext } from "../context/AppContext";

// 출연진 목록 컴포넌트
const ActorList = ({ actors }) => (
  <div className="actor-list">
    <ul>
      {actors.map((actor) => (
        <li key={actor.id}>
          <img
            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
            alt={actor.name}
            onError={(e) => (e.target.style.display = "none")} // 이미지가 없을 경우 숨김 처리
            style={{ borderRadius: "50%", width: "45px", height: "50px", marginRight: "10px" }}
          />
          {actor.name} - {actor.character}
        </li>
      ))}
    </ul>
  </div>
);


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

const ReviewForm = ({ reviewRating, setReviewRate, reviewContent, setReviewContent, addReview }) => (
  <div className="review-form">
    <h3>리뷰 작성</h3>
    <StarRating rating={reviewRating} setRating={setReviewRate} />

    <div className="review-input-container">
      <input
        className="review-input"
        placeholder="리뷰 내용을 입력해주세요"

        value={reviewContent}
        onChange={(e) => setReviewContent(e.target.value)}

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

      <span className="review-user">{item.userId}</span>
      <StarRating rating={item.reviewRating} size={15} readOnly />
      <span className="review-text">{item.reviewContent}</span>
      <span className="review-date">{item.reviewDate}</span>
      {username === item.userId && (

        <div className="review-actions">
          <button className="review-edit-button" onClick={() => onEdit(item)}>
            수정
          </button>

          <button className="review-delete-button" onClick={() => onRemove(item.reviewId)}>

            삭제
          </button>
        </div>
      )}
    </div>

    {editable && editState.reviewId === item.reviewId && (
      <div className="review-edit-form">
        <StarRating
          rating={editState.reviewRating}
          setRating={(newRate) =>
            editState.setEditState((prev) => ({ ...prev, reviewRating: newRate }))

          }
          size={15}
        />
        <input
          type="text"
          className="review-edit-input"
          placeholder="리뷰 내용을 입력해주세요"

          value={editState.reviewContent}
          onChange={(e) =>
            editState.setEditState((prev) => ({
              ...prev,
              reviewContent: e.target.value,

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

  const total = reviews.reduce((acc, cur) => acc + cur.reviewRating, 0);

  return (total / reviews.length).toFixed(2); // 소수점 2자리까지 표시
};

// 메인 MovieDetail 컴포넌트
const MovieDetail = ({ movie, onClose }) => {
  const [actor, setActor] = useState([]); // 출연진 상태 추가

  const [reviewRating, setReviewRate] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewList, setReviewList] = useState([]);
  const [editable, setEditable] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [editState, setEditState] = useState({ reviewId: -1, reviewRating: 5, reviewContent: "" });
  const [isLiked,setIsLiked] = useState((movie.id));

  const { user , addLikeMovie , removeLikeMovie , isMovieLiked } = useContext(AppContext)

  useEffect(() => {
    const fetchDetails = async () => {
      const castData = await fetchMovieCredits(movie.id); // 출연진 정보 가져오기
      setActor(castData.cast.slice(0, 10)); // 최대 10명의 출연진 정보 표시
    };

    fetchDetails();
    console.log(user)
  }, [movie]);

  const averageRating = calculateAverageRating(reviewList);

  const addReview = () => {
    if (!user) {
      alert("로그인한 유저만 리뷰를 등록 가능합니다")
      return;
    }
    const newReview = {

      reviewId: reviewList.length + 1,
      userId: user.userNick,
      reviewRating,
      reviewContent,
      reviewDate: moment().format("MM/DD HH:mm"),
    };
    if (!reviewContent) {

      alert("리뷰 내용을 입력해주세요")
      return;
    }
    if (window.confirm("등록 하시겠습니까?")) {
      setReviewList((prev) => [newReview, ...prev]);

      setReviewContent("");
      setReviewRate(5);

      // 새 리뷰 추가 시 더보기 상태 초기화
      setVisibleReviews(3);
    }
  };


  const handleRemove = (reviewId) => {
    if (window.confirm("삭제 하시겠습니까?")) {
      setReviewList((prev) => prev.filter((item) => item.reviewId !== reviewId));

      // 삭제 후 더보기 상태 조정
      setVisibleReviews(Math.min(visibleReviews, reviewList.length - 1));
    }
  };

  const handleEdit = (item) => {
    setEditable(true);

    setEditState({ reviewId: item.reviewId, reviewRating: item.reviewRating, reviewContent: item.reviewContent });

  };

  const updateReview = () => {
    if (window.confirm("수정 하시겠습니까?")) {
      setReviewList((prev) =>
        prev.map((item) =>

          item.reviewId === editState.reviewId
            ? { ...item, reviewRating: editState.reviewRating, reviewContent: editState.reviewContent }

            : item
        )
      );
      setEditable(false);

      setEditState({ reviewId: -1, reviewRating: 5, reviewContent: "" });

    }
  };

  const cancelEdit = () => {
    setEditable(false);

    setEditState({ reviewId: -1, reviewRating: 5, reviewContent: "" });

  };

  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 3);
  };

  if (!movie) return <div>Loading...</div>;

  const handleLikeToggle = () => {
    if(!user) {
      alert("로그인 후 좋아요를 할 수 있습니다.");
      return;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="modal-movie">
          <div className="modal-movie-container">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="modal-movie-poster"
            />
            <div className="modal-movie-details">
              <h1>
                {movie.title}
                {user && (
                  <button
                    onClick={handleLikeToggle}
                    style={{
                      background:'none',
                      border:'none',
                      cursor:'pointer',
                      height:5,
                      width:5
                    }}
                  >
                    {isLiked ? <FaHeart color="red"/> : <FaRegHeart color="gray" />}
                  </button>
                )}
              </h1>
              <p>{movie.overview}</p>
              <p><strong>개봉일:</strong> {movie.release_date}</p>
              <p><strong>평점:</strong> {movie.vote_average}</p>

              <h3>출연진</h3>

              {/* 출연진 목록 추가 */}
              <ActorList actors={actor} />
            </div>
          </div>
          <div>
            {/* 리뷰 작성 폼 */}
            <ReviewForm

              reviewRating={reviewRating}
              setReviewRate={setReviewRate}
              reviewContent={reviewContent}
              setReviewContent={setReviewContent}

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

                      key={item.reviewId}

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

                      username={user.userNick}

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
          </div>

          {/* 하단 여백 확보 */}
          <div style={{ height: '20px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
