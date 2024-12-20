package com.korea.moviestar.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
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
import com.korea.moviestar.security.TokenProvider;
import com.korea.moviestar.service.MailService;
import com.korea.moviestar.service.SocialService;
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
	private final SocialService socialService;

	private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	@GetMapping("/all")
	public ResponseEntity<?> userList() {
		List<UserDTO> dtos = service.findAll();
		ResponseDTO<UserDTO> response = ResponseDTO.<UserDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}

	@GetMapping("/{userId}")
	public ResponseEntity<?> userById(@PathVariable int userId) {
		UserDTO dto = service.findByUserId(userId);
		return ResponseEntity.ok().body(dto);
	}

	@GetMapping("/private/mine")
	public ResponseEntity<?> myUser(@AuthenticationPrincipal String userId) {
		UserDTO response = service.findByUserId(Integer.parseInt(userId));
		return ResponseEntity.ok().body(response);
	}

	@PostMapping("/signin")
	public ResponseEntity<?> signin(@RequestBody UserDTO dto) {

		try {
			UserDTO find = service.findUser(dto, passwordEncoder);
			if (find == null) {
				return ResponseEntity.badRequest()
						.body(ResponseDTO.builder().error("Invalid username or password").build());
			}

			UserEntity user = UserService.toEntity(find, movies);
			final String token = tokenProvider.create(user);

			// 쿠키 설정
			ResponseCookie cookie = ResponseCookie.from("token", token).httpOnly(true).secure(false).path("/")
					.maxAge(7 * 24 * 60 * 60).sameSite("Strict").build();

			// 각 영화의 상세 정보를 포함한 응답 생성
			Map<String, Object> userResponse = new HashMap<>();
			userResponse.put("userId", user.getUserId());
			userResponse.put("userEmail", user.getUserEmail());
			userResponse.put("userNick", user.getUserNick());
			userResponse.put("userName", user.getUserName());

			// 영화 정보를 Map으로 변환
			Set<Map<String, Object>> likedMovies = user.getUserLikeList().stream().map(movie -> {
				Map<String, Object> movieInfo = new HashMap<>();
				movieInfo.put("id", movie.getMovieId());
				movieInfo.put("title", movie.getMovieName());
				movieInfo.put("poster_path", movie.getMoviePoster());
				movieInfo.put("overview", movie.getMovieOverview());
				movieInfo.put("movieOpDate", movie.getMovieOpDate());
				movieInfo.put("movieScore", movie.getMovieScore());
				return movieInfo;
			}).collect(Collectors.toSet());

			userResponse.put("userLikeList", likedMovies);

			return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(userResponse);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ResponseDTO.builder().error("Internal server error").build());
		}
	}

	@PostMapping("/naver_signin")
	public ResponseEntity<?> naverLogin(@RequestParam String code, @RequestParam String state) {
		try {
			String accessToken = socialService.getNaverAccessToken(code, state);
			UserEntity user = socialService.getNaverUserInfo(accessToken);

			final String token = tokenProvider.create(user);

			// 쿠키 설정
			ResponseCookie cookie = ResponseCookie.from("token", token).httpOnly(true).secure(false).path("/")
					.maxAge(7 * 24 * 60 * 60).sameSite("Strict").build();

			
			Map<String, Object> userResponse = new HashMap<>();
			userResponse.put("userId", user.getUserId());
			userResponse.put("userEmail", user.getUserEmail());
			userResponse.put("userNick", user.getUserNick());
			userResponse.put("userName", user.getUserName());

			// 영화 정보를 Map으로 변환
			Set<Map<String, Object>> likedMovies = user.getUserLikeList().stream().map(movie -> {
				Map<String, Object> movieInfo = new HashMap<>();
				movieInfo.put("id", movie.getMovieId());
				movieInfo.put("title", movie.getMovieName());
				movieInfo.put("poster_path", movie.getMoviePoster());
				movieInfo.put("overview", movie.getMovieOverview());
				movieInfo.put("movieOpDate", movie.getMovieOpDate());
				movieInfo.put("movieScore", movie.getMovieScore());
				return movieInfo;
			}).collect(Collectors.toSet());

			userResponse.put("userLikeList", likedMovies);

			return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(userResponse);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ResponseDTO.builder().error("Internal server error").build());
		}
	}
	
	@PostMapping("/google_signin")
	public ResponseEntity<?> googleLogin(@RequestParam String code) {
		try {
			String accessToken = socialService.getGoogleAccessToken(code);
			UserEntity user = socialService.getGoogleUserInfo(accessToken);

			final String token = tokenProvider.create(user);

			// 쿠키 설정
			ResponseCookie cookie = ResponseCookie.from("token", token).httpOnly(true).secure(false).path("/")
					.maxAge(7 * 24 * 60 * 60).sameSite("Strict").build();

			
			Map<String, Object> userResponse = new HashMap<>();
			userResponse.put("userId", user.getUserId());
			userResponse.put("userEmail", user.getUserEmail());
			userResponse.put("userNick", user.getUserNick());
			userResponse.put("userName", user.getUserName());

			// 영화 정보를 Map으로 변환
			Set<Map<String, Object>> likedMovies = user.getUserLikeList().stream().map(movie -> {
				Map<String, Object> movieInfo = new HashMap<>();
				movieInfo.put("id", movie.getMovieId());
				movieInfo.put("title", movie.getMovieName());
				movieInfo.put("poster_path", movie.getMoviePoster());
				movieInfo.put("overview", movie.getMovieOverview());
				movieInfo.put("movieOpDate", movie.getMovieOpDate());
				movieInfo.put("movieScore", movie.getMovieScore());
				return movieInfo;
			}).collect(Collectors.toSet());

			userResponse.put("userLikeList", likedMovies);

			return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(userResponse);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ResponseDTO.builder().error("Internal server error").build());
		}
	}

	@GetMapping("/verify-token")
	public ResponseEntity<?> verifyToken(@CookieValue(value = "token", required = false) String token) {
		if (token == null || token.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is missing or invalid");
		}

		try {
			// 토큰 검증
			String userId = tokenProvider.validateAndGetUserId(token);
			return ResponseEntity.ok().body(Map.of("userId", userId));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
		}
	}

	@PostMapping("/logout")
	public ResponseEntity<?> logout() {
		ResponseCookie cookie = ResponseCookie.from("token", null).httpOnly(true).secure(true).path("/").maxAge(0) // 즉시
																													// 만료
				.build();

		return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body("Logged out");

	}

	@GetMapping("/find-id")
	public ResponseEntity<?> findIdByEmail(@RequestParam String email) {
		try {
			UserDTO user = service.findByEmail(email); // 이메일로 사용자 검색
			return ResponseEntity.ok().body(Map.of("success", true, "userName", user.getUserName() // 찾은 아이디 반환
			));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "해당 이메일로 등록된 아이디를 찾을 수 없습니다."));
		}
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody UserDTO dto) {
		try {
			dto.setUserPwd(passwordEncoder.encode(dto.getUserPwd()));
			UserDTO response = service.createUser(dto);
			return ResponseEntity.ok().body(Map.of("success", true, "message", "Signup successed", "data", response));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
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
	public ResponseEntity<?> likeMovie(@AuthenticationPrincipal String userId, @RequestBody Map<String, Integer> request // movieId를
																															// 받을
																															// 객체
																															// 추가
	) {
		UserDTO response = service.addLike(userId, request.get("movieId"));
		return ResponseEntity.ok().body(response);
	}

	@DeleteMapping("/private/dislike")
	public ResponseEntity<?> dislikeMovie(@AuthenticationPrincipal String userId,
			@RequestBody Map<String, Integer> request // movieId를 받을 객체 추가
	) {
		UserDTO response = service.deleteLike(userId, request.get("movieId"));
		return ResponseEntity.ok().body(response);
	}

	@PutMapping("/private/modify")
	public ResponseEntity<?> modifyUser(@RequestBody UserDTO dto) {
		try {
			dto.setUserPwd(passwordEncoder.encode(dto.getUserPwd()));
			UserDTO response = service.update(dto);
			return ResponseEntity.ok().body(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}

	}

	@PutMapping("/modifyPwd")
	public ResponseEntity<?> modifyPwd(@RequestParam String email, @RequestBody String pwd) {
		try {
			String newPwd = passwordEncoder.encode(pwd);
			UserDTO response = service.updatePwd(email, newPwd);
			return ResponseEntity.ok().body(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}

	}

}
