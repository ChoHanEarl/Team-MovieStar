package com.korea.moviestar.dto;

import java.util.Date;

import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.ReviewEntity;
import com.korea.moviestar.entity.UserEntity;
import com.mysql.cj.x.protobuf.MysqlxCrud.Find;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
	private int reviewId;
	private int movieId;
	private int userId;
	private int reviewRating;
	private String reviewContent;
	private Date reviewDate;
	
	public ReviewDTO(ReviewEntity entity) {
		this.reviewId = entity.getReviewId();
		this.movieId = entity.getMovie().getMovieId();
		this.userId = entity.getUser().getUserId();
		this.reviewRating = entity.getReviewRating();
		this.reviewContent = entity.getReviewContent();
		this.reviewDate = entity.getReviewDate();
	}
	
	public static ReviewEntity toEntity(ReviewDTO dto, UserEntity user, MovieEntity movie) {
		return ReviewEntity.builder()
					.reviewId(dto.getReviewId())
					.movie(movie)
					.user(user)
					.reviewRating(dto.getReviewRating())
					.reviewContent(dto.getReviewContent())
					.reviewDate(dto.getReviewDate())
					.build();
	}
}
