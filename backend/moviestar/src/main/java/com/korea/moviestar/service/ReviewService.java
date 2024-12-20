package com.korea.moviestar.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.korea.moviestar.dto.ReviewDTO;
import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.ReviewEntity;
import com.korea.moviestar.entity.UserEntity;
import com.korea.moviestar.repo.MovieRepository;
import com.korea.moviestar.repo.ReviewRepository;
import com.korea.moviestar.repo.ThemeRepository;
import com.korea.moviestar.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {
	private final ReviewRepository repository;
	private final UserRepository users;
	private final MovieRepository movies;
	
	public List<ReviewDTO> findAll(){
		List<ReviewEntity> entities = repository.findAll();
		return entities.stream().map(ReviewDTO::new).collect(Collectors.toList());
	}
	
	public List<ReviewDTO> findByUserId(String userId){
		int user = Integer.parseInt(userId);
		Optional<UserEntity> origin = users.findById(user);
		if(origin.isPresent()) {
			List<ReviewEntity> entities = repository.findByUserUserId(user);
			return entities.stream().map(ReviewDTO::new).collect(Collectors.toList());
		}
		return null;
	}
	
	// 특정 영화의 리뷰 조회
	public List<ReviewDTO> findByMovieId(int movieId){
		Optional<MovieEntity> origin = movies.findById(movieId);
		if(origin.isPresent()) {
			List<ReviewEntity> entities = repository.findByMovieMovieId(movieId);
			return entities.stream().map(ReviewDTO::new).collect(Collectors.toList());
		}
		return null;
	}
	
	// 리뷰 등록
	public ReviewDTO create(String userId, ReviewDTO dto) {
		int user = Integer.parseInt(userId);
		Optional<UserEntity> originUser = users.findById(user);
		Optional<MovieEntity> originMovie = movies.findById(dto.getMovieId());
		if(originUser.isPresent() && originMovie.isPresent()) {
			dto.setUserId(user);
			ReviewEntity entity = ReviewDTO.toEntity(dto, originUser.get(), originMovie.get());
			return new ReviewDTO(repository.save(entity));
		}
		return null;
	}
	
	public ReviewDTO update(int reviewId, ReviewDTO dto) {
		Optional<ReviewEntity> origin = repository.findById(reviewId);
		if(origin.isPresent()) {
			 ReviewEntity newReview = origin.get();
			 newReview.setReviewRating(dto.getReviewRating());
			 newReview.setReviewContent(dto.getReviewContent());
			 return new ReviewDTO(repository.save(newReview));
		}
		return null;
	}
	
	public boolean delete(int reviewId) {
		Optional<ReviewEntity> origin = repository.findById(reviewId);
		if(origin.isPresent()) {
			repository.delete(origin.get());
			return true;
		}
		return false;
	}
	
}
