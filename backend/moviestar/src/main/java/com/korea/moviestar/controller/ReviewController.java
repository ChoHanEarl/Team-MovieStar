package com.korea.moviestar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.moviestar.dto.ResponseDTO;
import com.korea.moviestar.dto.ReviewDTO;
import com.korea.moviestar.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/review")
public class ReviewController {

	private final ReviewService service;
	
	@GetMapping("/all")
	public ResponseEntity<?> reviewList(){
		List<ReviewDTO> dtos = service.findAll();
		ResponseDTO<ReviewDTO> response = ResponseDTO.<ReviewDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	@GetMapping("/private/myreview")
	public ResponseEntity<?> reviewByUserId(@AuthenticationPrincipal String userId){
		List<ReviewDTO> dtos = service.findByUserId(userId);
		ResponseDTO<ReviewDTO> response = ResponseDTO.<ReviewDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	// 특정 영화의 리뷰 조회(로그인하지 않아도 가능)
	@GetMapping("/{movieId}")
	public ResponseEntity<?> reviewByMovieId(@PathVariable int movieId){
		List<ReviewDTO> dtos = service.findByMovieId(movieId);
		ResponseDTO<ReviewDTO> response = ResponseDTO.<ReviewDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	// 리뷰 등록(로그인한 유저만 가능)
	@PostMapping("/private/write")
	public ResponseEntity<?> writeReview(@AuthenticationPrincipal String userId, @RequestBody ReviewDTO dto){
		ReviewDTO response = service.create(userId, dto);
		return ResponseEntity.ok().body(response);
	}
	
	@PutMapping("/private/modify/{reviewId}")
	public ResponseEntity<?> modifyReview(@PathVariable int reviewId, @RequestBody ReviewDTO dto){
		ReviewDTO response = service.update(reviewId, dto);
		return ResponseEntity.ok().body(response);
	}
	
	@DeleteMapping("/private/remove/{reviewId}")
	public ResponseEntity<?> removeReview(@PathVariable int reviewId){
		if(service.delete(reviewId)) {
			return ResponseEntity.ok().body("succesfully remove");
		}else {
			return ResponseEntity.badRequest().body("fail to remove");
		}
	}
	
}
