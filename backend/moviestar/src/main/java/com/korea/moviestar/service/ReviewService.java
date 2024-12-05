package com.korea.moviestar.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.korea.moviestar.dto.ReviewDTO;
import com.korea.moviestar.entity.ReviewEntity;
import com.korea.moviestar.entity.UserEntity;
import com.korea.moviestar.repo.ReviewRepository;
import com.korea.moviestar.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {
	private final ReviewRepository repository;
	private final UserRepository users;
	
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
	
	public ReviewDTO create(String userId, ReviewDTO dto) {
		int user = Integer.parseInt(userId);
		Optional<UserEntity> origin = users.findById(user);
		if(origin.isPresent()) {
			dto.setUserId(user);
			ReviewEntity entity = ReviewDTO.toEntity(dto, origin.get());
			return new ReviewDTO(repository.save(entity));
		}
		return null;
	}
	
	public ReviewDTO update(ReviewDTO dto) {
		Optional<ReviewEntity> origin = repository.findById(dto.getReviewId());
		if(origin.isPresent()) {
			 ReviewEntity newReview = origin.get();
			 newReview.setReviewRating(dto.getReviewRating());
			 newReview.setReviewContent(dto.getReviewContent());
			 return new ReviewDTO(repository.save(newReview));
		}
		return null;
	}
	
}
