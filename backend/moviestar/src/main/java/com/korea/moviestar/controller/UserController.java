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

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
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
	        if (dto == null) {
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("DTO is null");
	        }

	        // 사용자 정보 찾기
	        UserDTO find = service.findUser(dto, passwordEncoder);
	        if (find == null || !passwordEncoder.matches(dto.getUserPwd(), find.getUserPwd())) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
	        }

	        // 사용자 엔티티 생성 및 토큰 생성
	        UserEntity user = UserService.toEntity(find, movies);
	        final String token = tokenProvider.create(user);

	        // 쿠키 설정
	        ResponseCookie cookie = ResponseCookie.from("token", token)
	                .httpOnly(true) // 클라이언트에서 접근 불가
	                .secure(false)  // HTTP만 가능 (실제 운영에서는 true로 설정)
	                .path("/")      // 모든 경로에서 사용 가능
	                .maxAge(7 * 24 * 60 * 60) // 7일
	                .sameSite("Strict") // SameSite 설정
	                .build();

	        // 사용자 정보 응답
	        Map<String, Object> userResponse = new HashMap<>();
	        userResponse.put("userId", user.getUserId());
	        userResponse.put("userEmail", user.getUserEmail());
	        userResponse.put("userNick", user.getUserNick());
	        userResponse.put("userName", user.getUserName());

	        // 영화 정보를 Map으로 변환
	        Set<Map<String, Object>> likedMovies = user.getUserLikeList().stream().map(movie -> {
	            Map<String, Object> movieInfo = new HashMap<>();
	            movieInfo.put("movieId", movie.getMovieId());
	            movieInfo.put("movieName", movie.getMovieName());
	            movieInfo.put("moviePoster", movie.getMoviePoster());
	            movieInfo.put("movieOverview", movie.getMovieOverview());
	            movieInfo.put("movieOpDate", movie.getMovieOpDate());
	            movieInfo.put("movieScore", movie.getMovieScore());
	            return movieInfo;
	        }).collect(Collectors.toSet());

	        userResponse.put("userLikeList", likedMovies);

	        return ResponseEntity.ok()
	                .header(HttpHeaders.SET_COOKIE, cookie.toString())
	                .body(userResponse);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Internal server error");
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
	            movieInfo.put("movieId", movie.getMovieId());
	            movieInfo.put("movieName", movie.getMovieName());
	            movieInfo.put("moviePoster", movie.getMoviePoster());
	            movieInfo.put("movieOverview", movie.getMovieOverview());
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
	            movieInfo.put("movieId", movie.getMovieId());
	            movieInfo.put("movieName", movie.getMovieName());
	            movieInfo.put("moviePoster", movie.getMoviePoster());
	            movieInfo.put("movieOverview", movie.getMovieOverview());
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
	
	@GetMapping("/secure-data")
    public ResponseEntity<?> getSecureData(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String token = null;

        // 쿠키에서 "token"을 찾고 값을 확인
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null && !token.isEmpty()) {
            // 토큰이 유효한지 확인 (예시: 토큰 파싱 후 검증)
            boolean isValid = tokenProvider.validateToken(token);
            if (isValid) {
                // 유효한 경우 데이터 반환
                return ResponseEntity.ok().body("Valid token data");
            } else {
                // 유효하지 않은 경우
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }
        } else {
            // 쿠키에 토큰이 없는 경우
        	return ResponseEntity.ok().body("No token, but request is valid");
        }
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
	    try {
	    	mails.sendVerificationCode(email);
		    return ResponseEntity.ok().body(Map.of(
		    		"success", true,
		    		"message","인증코드를 이메일로 발송했습니다."
		    		));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of(
		            "success", false,
		            "message", "인증코드 발송에 에러가 발생했습니다."
					));
		}
		
	}

	@PostMapping("/verify_email")
	public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String email, @RequestParam String code) {
	    Map<String, String> response = new HashMap<>();
	    
	    try {
	        boolean isVerified = mails.verifyCode(email, code, passwordEncoder);

	        if (isVerified) {
	            response.put("status", "success");
	            response.put("message", "인증 성공");
	            return ResponseEntity.ok(response);
	        } else {
	            response.put("status", "error");
	            response.put("message", "인증코드가 일치하지 않습니다.");
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	        }
	    } catch (RuntimeException e) {
	        response.put("status", "error");
	        response.put("message", "인증 처리 중 오류가 발생했습니다: " + e.getMessage());
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	    } catch (Exception e) {
	        // 다른 예외 처리
	        response.put("status", "error");
	        response.put("message", "서버 오류: " + e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}

	@PutMapping("/private/like/{movieId}")
	public ResponseEntity<?> likeMovie(@AuthenticationPrincipal String userId, @PathVariable int movieId) {
		UserDTO response = service.addLike(userId, movieId);
		return ResponseEntity.ok().body(response);
	}

	@DeleteMapping("/private/dislike/{movieId}")
	public ResponseEntity<?> dislikeMovie(@AuthenticationPrincipal String userId,
			@PathVariable int movieId
	) {
		UserDTO response = service.deleteLike(userId, movieId);
		return ResponseEntity.ok().body(response);
	}

	@PutMapping("/private/modify")
	public ResponseEntity<?> modifyUser(@AuthenticationPrincipal String userId, @RequestBody UserDTO dto) {
		try {
			UserDTO response = service.update(userId, dto);
			return ResponseEntity.ok().body(response);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}

	}

	@PutMapping("/modifyPwd")
	public ResponseEntity<?> modifyPwd(@RequestParam String email, @RequestBody UserDTO dto){
		try {
			String newPwd = passwordEncoder.encode(dto.getUserPwd());
			UserDTO updatedUser = service.updatePwd(email, newPwd);
			
	        // 비밀번호 변경 후 새로운 토큰 발급
	        UserEntity user = UserService.toEntity(updatedUser, movies);
	        final String newToken = tokenProvider.create(user);  // 새로운 토큰 생성

	        // 새로운 토큰을 쿠키로 설정하여 클라이언트에 전달
	        ResponseCookie cookie = ResponseCookie.from("token", newToken)
		            .httpOnly(true) // 클라이언트에서 접근 불가
		            .secure(true)   // HTTPS에서만 전송
		            .path("/")      // 모든 경로에서 사용 가능
		            .maxAge(60 * 60 * 24) // 1일
		            .build();
	        
	        Map<String, Object> userResponse = new HashMap<>();
			userResponse.put("userId", user.getUserId());
			userResponse.put("userEmail", user.getUserEmail());
			userResponse.put("userNick", user.getUserNick());
			userResponse.put("userName", user.getUserName());

			// 영화 정보를 Map으로 변환
			Set<Map<String, Object>> likedMovies = user.getUserLikeList().stream().map(movie -> {
	            Map<String, Object> movieInfo = new HashMap<>();
	            movieInfo.put("movieId", movie.getMovieId());
	            movieInfo.put("movieName", movie.getMovieName());
	            movieInfo.put("moviePoster", movie.getMoviePoster());
	            movieInfo.put("movieOverview", movie.getMovieOverview());
	            movieInfo.put("movieOpDate", movie.getMovieOpDate());
	            movieInfo.put("movieScore", movie.getMovieScore());
	            return movieInfo;
	        }).collect(Collectors.toSet());
			userResponse.put("userLikeList", likedMovies);

			return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(userResponse);
		  
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

}
