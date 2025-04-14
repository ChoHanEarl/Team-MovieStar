package com.korea.moviestar.service;

import java.util.HashSet;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.UserEntity;
import com.korea.moviestar.repo.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialService {
	@Value("${naver.client-id}")
	private String naverClientId;

	@Value("${naver.client-secret}")
	private String naverClientSecret;
	
	@Value("${google.client.id}")
	private String GOOGLE_CLIENT_ID;
	@Value("${google.client.secret}")
	private String GOOGLE_CLIENT_SECRET;
	@Value("${google.login.redirect}")
	private String LOGIN_REDIRECT_URL;

	private final UserRepository repository;

	public String getNaverAccessToken(String code, String state) {

		log.info("Received code: {} and state: {}", code, state);

		WebClient webClient = WebClient.builder().baseUrl("https://nid.naver.com")
				.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE).build();

		// AccessToken 요청
		Map<String, Object> response = webClient.post()
				.uri(uriBuilder -> uriBuilder.path("/oauth2.0/token").queryParam("client_id", naverClientId)
						.queryParam("client_secret", naverClientSecret).queryParam("grant_type", "authorization_code")
						.queryParam("state", state).queryParam("code", code).build())
				.retrieve().bodyToMono(Map.class) // JSON 응답을 Map으로 매핑
				.block();

		// 토큰 추출

		return response.get("access_token").toString();
	}

	public UserEntity getNaverUserInfo(String accessToken) {
		WebClient webClient = WebClient.builder().baseUrl("https://openapi.naver.com")
				.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE).build();

		// 사용자 정보 요청
		Map<String, Object> response = webClient.get().uri("/v1/nid/me")
				.header("Authorization", "Bearer " + accessToken).retrieve().bodyToMono(Map.class) // JSON 응답을 Map으로 매핑
				.block();

		// 사용자 정보 추출
		Map<String, Object> res = (Map<String, Object>) response.get("response");
		log.info("User Info: {}", res);

		String email = (String) res.get("email");
		if (repository.findByUserEmail(email).isEmpty()) {

			UserEntity user = UserEntity.builder().userEmail(email).userName(email.split("@")[0] + "_naver")
					.userNick((String) res.get("nickname")).userPwd("password").userLikeList(new HashSet<MovieEntity>())
					.build();
			return repository.save(user);
		}
		return repository.findByUserEmail(email).get(); // 반환
	}
	
	public String getGoogleAccessToken(String accessCode) {
	    String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

	    RestTemplate restTemplate = new RestTemplate();
	    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

	    params.add("code", accessCode);
	    params.add("client_id", GOOGLE_CLIENT_ID);
	    params.add("client_secret", GOOGLE_CLIENT_SECRET);
	    params.add("redirect_uri", LOGIN_REDIRECT_URL);
	    params.add("grant_type", "authorization_code");

	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

	    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
	    
	    try {
	        ResponseEntity<String> responseEntity = restTemplate.postForEntity(GOOGLE_TOKEN_URL, request, String.class);

	        if (responseEntity.getStatusCode() == HttpStatus.OK) {
	            String jsonResponse = responseEntity.getBody();

	            // JSON 파싱
	            ObjectMapper objectMapper = new ObjectMapper();
	            JsonNode jsonNode = objectMapper.readTree(jsonResponse);

	            return jsonNode.get("access_token").asText();
	        }
	    } catch (HttpClientErrorException e) {
	        System.err.println("Error during Google token request: " + e.getMessage());
	        System.err.println("Response body: " + e.getResponseBodyAsString());
	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return null;
	}
	
	public UserEntity getGoogleUserInfo(String accessToken) {
		WebClient webClient = WebClient.builder()
				.baseUrl("https://www.googleapis.com")
				.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.build();
		
		Map<String, Object> response = webClient.get()
	            .uri(uriBuilder -> uriBuilder
	                    .path("/oauth2/v2/userinfo")
	                    .build())
	            .header("Authorization", "Bearer " + accessToken)
	            .retrieve()
	            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
	            .block();
		
		log.info("User Info: {}", response);
		
		String email = (String) response.get("email");
		if (repository.findByUserEmail(email).isEmpty()) {

			UserEntity user = UserEntity.builder().userEmail(email).userName(email.split("@")[0] + "_google")
					.userNick((String) response.get("name")).userPwd("password").userLikeList(new HashSet<MovieEntity>())
					.build();
			return repository.save(user);
		}
		
		
		return repository.findByUserEmail(email).get();
	}
}
