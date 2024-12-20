package com.korea.moviestar.security;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.korea.moviestar.entity.UserEntity;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@Service
public class TokenProvider {
    private final Key key;

    // Key 생성
    public TokenProvider() {
        this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }

    // JWT 토큰 생성
    public String create(UserEntity userEntity) {
        Date expiryDate = Date.from(
                Instant.now()
                        .plus(1, ChronoUnit.DAYS)); // 만료 기간 설정 (1일)

        return Jwts.builder()
                .signWith(key, SignatureAlgorithm.HS256) // 서명
                .setSubject(Integer.toString(userEntity.getUserId())) // sub
                .setIssuer("MovieStar") // iss
                .setIssuedAt(new Date()) // iat
                .setExpiration(expiryDate) // exp
                .compact();
    }

    // JWT 토큰 검증 및 사용자 ID 추출
    public String validateAndGetUserId(String token) {
        try {
            // 파싱 및 서명 검증
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key) // 키 설정
                    .build()
                    .parseClaimsJws(token) // 토큰 파싱 및 검증
                    .getBody();

            return claims.getSubject(); // 토큰에서 사용자 ID 반환
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("JWT 토큰이 만료되었습니다.");
        } catch (UnsupportedJwtException e) {
            throw new RuntimeException("지원되지 않는 JWT 토큰입니다.");
        } catch (MalformedJwtException e) {
            throw new RuntimeException("JWT 형식이 잘못되었습니다.");
        } catch (SignatureException e) {
            throw new RuntimeException("JWT 서명이 유효하지 않습니다.");
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("JWT 토큰이 비어 있거나 잘못되었습니다.");
        }
    }
}

