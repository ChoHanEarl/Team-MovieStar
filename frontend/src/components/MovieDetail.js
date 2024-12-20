import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieDetails, fetchMovieCredits } from "../api/tmdb";
import { searchYouTubeTrailer } from "../api/youtube";
import { FaHeart, FaRegHeart, FaStar , FaPlay } from "react-icons/fa";
import moment from "moment";
import "../css/detail/Detail.css"
import "../css/detail/Review.css"
import "../css/detail/Modal.css"
import "../css/detail/Trailer.css"
import { AppContext } from "../context/AppContext";
import axios from "axios";

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

const formatDate = (isoString) => {
  return moment(isoString).format("YY/MM/DD HH:mm")
}

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
}) => {

  return (
  <li className="review-item">
    <div className="review-item-container">
      <span className="review-user">{item.userNick}</span>
      <StarRating rating={item.reviewRating} size={15} readOnly />
      <span className="review-text">{item.reviewContent}</span>
      <span className="review-date">{formatDate(item.reviewDate)}</span>
      {username === item.userNick && (
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
  )
};

//트레일러 모달 컴포넌트
const TrailerModal = ({trailerUrl,onClose}) => {
  return(
    <div className="trailer-modal-overlay" onClick={onClose}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        {trailerUrl ? (
          <iframe
            width="100%"
            height="500"
            src={trailerUrl}
            title="YouTube Video Player"
            frameBorder="0"
            allow=""
            allowFullScreen
          ></iframe>
        ) : (
          <p>예고편을 찾을수 없습니다.</p>
        )}
      </div>
    </div>
  )
}

// 평균 평점 계산 함수
const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((acc, cur) => acc + cur.reviewRating, 0);

  return (total / reviews.length).toFixed(2); // 소수점 2자리까지 표시
};

// 메인 MovieDetail 컴포넌트
const MovieDetail = ({ movie, onClose }) => {
  const { user, addLikeMovie, removeLikeMovie, isMovieLiked } = useContext(AppContext);


  const [actor, setActor] = useState([]); 
  const [reviewRating, setReviewRate] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewList, setReviewList] = useState([]);
  const [editable, setEditable] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [editState, setEditState] = useState({ reviewId: -1, reviewRating: 5, reviewContent: "" });
  
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  
  // 좋아요 상태 동기화
  useEffect(() => {
    if (user && movie) {
        setIsLiked(isMovieLiked(movie.id));
    }
}, [user, movie, isMovieLiked]);

  useEffect(() => {
    const fetchDetails = async () => {
      const castData = await fetchMovieCredits(movie.id); // 출연진 정보 가져오기
      setActor(castData.cast.slice(0, 10)); // 최대 10명의 출연진 정보 표시
    };

    fetchDetails();
    console.log(user)
  }, [movie]);

  const averageRating = calculateAverageRating(reviewList);

  // 리뷰 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:9090/review/${movie.id}`)
        console.log("Fetched Reviews:", response.data.data)
        const reviews = Array.isArray(response.data.data) ? response.data.data : []
        setReviewList(reviews)
      } catch (error) {
        console.error("리뷰 로드 실패:", error)
      }
    }
    fetchReviews()
  }, [movie.id])
  

  const addReview = async () => {
    if (!user) {
      alert("로그인한 유저만 리뷰를 등록할 수 있습니다.")
      return;
    }
    
    const newReview = {
      movieId : movie.id,
      reviewRating,
      reviewContent,
    };

    try {
      if(window.confirm("리뷰를 등록하시겠습니까?")) {
        const response = await axios.post(
          "http://localhost:9090/review/private/write",
          newReview,
          { withCredentials: true}
        )
        setReviewList((prev) => [response.data, ...prev])
        setReviewContent("")
        setReviewRate(5)
  
        // 새 리뷰 추가 시 더보기 상태 초기화
        setVisibleReviews(3);
      }
    } catch (error) {
      console.error("리뷰 등록 실패:", error)
    }
  };

  const handleRemove = async (reviewId) => {
    try {
      if (window.confirm("정말 삭제하시겠습니까?")) {
        const response = await axios.delete(
          `http://localhost:9090/review/private/remove/${reviewId}`,
          { withCredentials: true }
        )

        if (response.status = 200) {
          alert("리뷰가 삭제되었습니다.")
          setReviewList((prev) => prev.filter((item) => item.reviewId !== reviewId))
          // 삭제 후 더보기 상태 조정
          setVisibleReviews(Math.min(visibleReviews, reviewList.length - 1));
        }
      }  
    } catch(error) {
      console.error("리뷰 삭제 중 오류 발생:", error)
    }
  };

  const handleEdit = (item) => {
    setEditable(true);

    setEditState({ reviewId: item.reviewId, reviewRating: item.reviewRating, reviewContent: item.reviewContent });
  };

  const updateReview = async () => {
    try {
      const response = await axios.put(
        `http://localhost:9090/review/private/modify/${editState.reviewId}`,
        {
          reviewContent: editState.reviewContent,
          reviewRating: editState.reviewRating,
        },
        { widthCredentials: true }
      )
      
      if (response.status === 200) {
        alert("리뷰가 수정되었습니다.")
        setReviewList((prev) =>
          prev.map((item) =>
            item.reviewId === editState.reviewId
              ? { ...item, ...response.data }
              : item
          )
        )

        setEditable(false)

        setEditState({ reviewId: -1, reviewRating: 5, reviewContent: ""})
      }
    } catch (error) {
      console.error("리뷰 수정 중 오류 발생:", error)
    }
  };

  const cancelEdit = () => {
    setEditable(false);

    setEditState({ reviewId: -1, reviewRating: 5, reviewContent: "" });
  };

  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 3);
  };

// MovieDetail.js의 handleLikeToggle 함수만 수정 (나머지는 그대로 유지)

  // 좋아요 토글 함수 수정
  const handleLikeToggle = async () => {
    if (!user) {
        alert("로그인 후 좋아요를 할 수 있습니다.");
        return;
    }

    try {
        if (isLiked) {
            const response = await axios.delete('http://localhost:9090/user/private/dislike', {
                data: { movieId: movie.id },
                withCredentials: true
            });
            console.log("좋아요 삭제 응답:", response.data);
            removeLikeMovie(movie.id);
        } else {
            const response = await axios.put(
                'http://localhost:9090/user/private/like', 
                { movieId: movie.id },
                { withCredentials: true }
            );
            console.log("좋아요 추가 응답:", response.data);
            addLikeMovie(movie);
        }
        setIsLiked(!isLiked);
    } catch (error) {
        console.error("좋아요 처리 중 오류 발생:", error);
        if (error.response?.status === 401) {
            alert("로그인이 필요합니다.");
        } else {
            alert("좋아요 처리 중 오류가 발생했습니다.");
        }
    }
};

  //예고편 검색 함수
  const searchTrailer = async () => {
    try {
        const trailer = await searchYouTubeTrailer(`${movie.title} 예고편`);
        if (trailer) {
            const embedUrl = `https://www.youtube.com/embed/${trailer.id.videoId}`;
            setTrailerUrl(embedUrl);
        } else {
            alert("적합한 예고편을 찾을 수 없습니다.");
        }
    } catch (error) {
        alert("예고편을 찾을 수 없습니다.");
        console.error("Error searching for trailer:", error);
    }
};



  if (!movie) return <div>Loading...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-movie">
        <div className="modal-movie-container">
          <div className="modal-movie-poster-container">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="modal-movie-poster"
            />
            <button
              className="trailer-play-button"
              onClick={(e) => {
                e.stopPropagation();
                searchTrailer();
                setShowTrailerModal(true);
              }}
            >
              <FaPlay /> 예고편
            </button>
          </div>

          <div className="modal-movie-details">
            <h1>
              {movie.title}
              {user && (
                <button
                  onClick={handleLikeToggle}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    height: 5,
                    width: 5,
                  }}
                >
                  {isLiked ? <FaHeart color="red" /> : <FaRegHeart color="gray" />}
                </button>
              )}
            </h1>
            <p>{movie.overview}</p>
            <p>
              <strong>개봉일:</strong> {movie.release_date}
            </p>
            <p>
              <strong>평점:</strong> {movie.vote_average}
            </p>
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
                      username={user?.userNick}
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

          {showTrailerModal && (
            <TrailerModal
              trailerUrl={trailerUrl}
              onClose={() => setShowTrailerModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;