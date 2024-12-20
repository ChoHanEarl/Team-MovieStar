package com.korea.moviestar.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    TokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = parseCookieToken(request);  // 쿠키에서 토큰 파싱
            
            if(token != null && !token.equalsIgnoreCase("null")) {
                String userId = tokenProvider.validateAndGetUserId(token);
                log.info("Authenticated user ID : {}", userId);
                
                AbstractAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId, 
                        null,
                        AuthorityUtils.NO_AUTHORITIES
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            }
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String parseCookieToken(HttpServletRequest request) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if (cookie.getName().equals("token")) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
