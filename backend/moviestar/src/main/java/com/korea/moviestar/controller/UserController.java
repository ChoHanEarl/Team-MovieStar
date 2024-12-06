package com.korea.moviestar.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.moviestar.dto.ResponseDTO;
import com.korea.moviestar.dto.UserDTO;

import com.korea.moviestar.entity.UserEntity;
import com.korea.moviestar.repo.MovieRepository;
import com.korea.moviestar.security.TokenProvider;

import com.korea.moviestar.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("user")
public class UserController {
	private final UserService service;
	private final MovieRepository movies;

	private final TokenProvider tokenProvider;
	
	private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	
	@GetMapping("/all")
	public ResponseEntity<?> userList(){
		List<UserDTO> dtos = service.findAll();
		ResponseDTO<UserDTO> response = ResponseDTO.<UserDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}

	@GetMapping("/{userId}")
	public ResponseEntity<?> userById(@PathVariable int userId){
		UserDTO dto = service.findByUserId(userId);
		return ResponseEntity.ok().body(dto);
	}
	
	@GetMapping("/private/mine")
	public ResponseEntity<?> myUser(@AuthenticationPrincipal String userId){
		UserDTO response = service.findByUserId(Integer.parseInt(userId));
		return ResponseEntity.ok().body(response);
	}
	
	@PostMapping("/signin")
	public ResponseEntity<?> signin(@RequestBody UserDTO dto){
		UserDTO find = service.findUser(dto, passwordEncoder);
		
		if(find != null) {
			UserEntity user = UserService.toEntity(find, movies);
			final String token = tokenProvider.create(user);
			UserDTO response = UserDTO.builder()
					.userId(user.getUserId())
					.userEmail(user.getUserEmail())
					.userNick(user.getUserNick())
					.userName(user.getUserName())
					.token(token)
					.build();
			return ResponseEntity.ok().body(response);
		} else {
			ResponseDTO responseDTO = ResponseDTO.builder().error("Login failed.").build();
			return ResponseEntity.badRequest().body(responseDTO);
		}
	}
	
	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody UserDTO dto){
		dto.setUserPwd(passwordEncoder.encode(dto.getUserPwd()));
		UserDTO response = service.createUser(dto);
		return ResponseEntity.ok().body(response);
	}
	
	@PutMapping("/private/like")
	public ResponseEntity<?> likeMovie(@AuthenticationPrincipal String userId, @RequestBody int movieId){
		UserDTO response = service.addLike(userId, movieId);
		return ResponseEntity.ok().body(response);
	}
	
	@DeleteMapping("/private/dislike")
	public ResponseEntity<?> dislikeMovie(@AuthenticationPrincipal String userId, @RequestBody int movieId){
		UserDTO response = service.deleteLike(userId, movieId);
		return ResponseEntity.ok().body(response);
	}
	
	@PutMapping("/private/modify")
	public ResponseEntity<?> modifyUser(@RequestBody UserDTO dto){
		dto.setUserPwd(passwordEncoder.encode(dto.getUserPwd()));
		UserDTO response = service.update(dto);
		return ResponseEntity.ok().body(response);
	}
}
