package com.korea.moviestar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
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
	
	@PostMapping("/private/write")
	public ResponseEntity<?> writeReview(@AuthenticationPrincipal String userId, @RequestBody ReviewDTO dto){
		ReviewDTO response = service.create(userId, dto);
		return ResponseEntity.ok().body(response);
	}
	
	@PutMapping("/private/modify")
	public ResponseEntity<?> modifyReview(@AuthenticationPrincipal String userId, @RequestBody ReviewDTO dto){
		ReviewDTO response = service.update(dto);
		return ResponseEntity.ok().body(response);
	}
	
}
