package com.korea.moviestar.security;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.korea.moviestar.entity.UserEntity;

import io.jsonwebtoken.*;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class TokenProvider {
	private final Key key;
	
	public TokenProvider() {
        this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }
	
	public String create(UserEntity userEntity) {
		Date expiryDate = Date.from(
				Instant.now()
				.plus(1, ChronoUnit.DAYS));
		
		return Jwts.builder()
				.signWith(key, SignatureAlgorithm.HS256) //서명
				.setSubject(Integer.toString(userEntity.getUserId())) // sub
				.setIssuer("MovieStar") // iss
				.setIssuedAt(new Date()) // iat
				.setExpiration(expiryDate) // exp
				.compact();
	}
	public String validateAndGetUserId(String token) {
		Claims claims = Jwts.parser()
						.setSigningKey(key) //키 확인
						.parseClaimsJws(token) //파싱 + 검증
						.getBody();

		return claims.getSubject();
	}
}
