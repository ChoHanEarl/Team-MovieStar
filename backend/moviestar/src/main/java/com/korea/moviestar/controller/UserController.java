package com.korea.moviestar.controller;


import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.moviestar.dto.ResponseDTO;
import com.korea.moviestar.dto.UserDTO;
import com.korea.moviestar.entity.UserEntity;
import com.korea.moviestar.repo.MovieRepository;
import com.korea.moviestar.repo.UserRepository;
import com.korea.moviestar.security.TokenProvider;
import com.korea.moviestar.service.MailService;
import com.korea.moviestar.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("user")
public class UserController {
	private final UserService service;
	private final MovieRepository movies;
	private final MailService mails;
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
	public ResponseEntity<?> signin(@RequestBody UserDTO dto) {
	    log.info("User login attempt: {}", dto.getUserName());

	    try {
	        // 사용자 조회 및 비밀번호 확인
	        UserDTO find = service.findUser(dto, passwordEncoder);
	        if (find == null || !passwordEncoder.matches(dto.getUserPwd(), find.getUserPwd())) {
	            log.error("Login failed for user: {}", dto.getUserName());
	            ResponseDTO responseDTO = ResponseDTO.builder()
	                    .error("Invalid username or password")
	                    .build();
	            return ResponseEntity.badRequest().body(responseDTO);
	        }

	        // 토큰 생성
	        UserEntity user = UserService.toEntity(find, movies);
	        final String token = tokenProvider.create(user);

	        // HttpOnly 쿠키 생성
	        ResponseCookie cookie = ResponseCookie.from("token", token)
	                .httpOnly(true)
	                .secure(false)
	                .path("/")
	                .maxAge(7 * 24 * 60 * 60)
	                .sameSite("Strict")
	                .build();

	        // 사용자 정보를 담은 응답 객체 생성
	        UserDTO response = UserDTO.builder()
	                .userId(user.getUserId())
	                .userEmail(user.getUserEmail())
	                .userNick(user.getUserNick())
	                .userName(user.getUserName())
	                .build();

	        log.info("Login successful for user: {}", user.getUserName());
	        return ResponseEntity.ok()
	                .header(HttpHeaders.SET_COOKIE, cookie.toString()) // 쿠키 설정
	                .body(response); // 사용자 정보 전달
	    } catch (Exception e) {
	        log.error("Unexpected error during login for user: {}", dto.getUserName(), e);
	        ResponseDTO responseDTO = ResponseDTO.builder()
	                .error("Internal server error")
	                .build();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
	    }
	}
	
	@GetMapping("/find-id")
	public ResponseEntity<?> findIdByEmail(@RequestParam String email) {
	    try {
	        UserDTO user = service.findByEmail(email); // 이메일로 사용자 검색
	        return ResponseEntity.ok().body(Map.of(
	            "success", true,
	            "userName", user.getUserName() // 찾은 아이디 반환
	        ));
	    } catch (RuntimeException e) {
	        return ResponseEntity.badRequest().body(Map.of(
	            "success", false,
	            "message", "해당 이메일로 등록된 아이디를 찾을 수 없습니다."
	        ));
	    }
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody UserDTO dto){
		try {
			dto.setUserPwd(passwordEncoder.encode(dto.getUserPwd()));
			UserDTO response = service.createUser(dto);
			return ResponseEntity.ok().body(Map.of(
					"success", true,
					"message", "Signup successed",
					"data", response
					));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"message", e.getMessage()
					));
		}
	}
	
	@PostMapping("/request_verification")
	public ResponseEntity<?> requestVerification(@RequestParam String email) {
	    mails.sendVerificationCode(email);
	    return ResponseEntity.ok().body("인증 코드가 전송되었습니다");
	}
	
	@PostMapping("/verify_email")
	public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String code) {
	    if (mails.verifyCode(email, code, passwordEncoder)) {
	        return ResponseEntity.ok().body("이메일 인증 성공");
	    }
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증 실패");
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
		try {
			dto.setUserPwd(passwordEncoder.encode(dto.getUserPwd()));
			UserDTO response = service.update(dto);
			return ResponseEntity.ok().body(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
		
	}
	
	@PutMapping("/modifyPwd")
	public ResponseEntity<?> modifyPwd(@RequestParam String email, @RequestBody String pwd){
		try {
			String newPwd = passwordEncoder.encode(pwd);
			UserDTO response = service.updatePwd(email, newPwd);
			return ResponseEntity.ok().body(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
		
	}
	
}
