package com.korea.moviestar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//CORS
//하나의 출처에서 다른 출처로 REQUEST를 허용해주는것.
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
		.allowedOrigins("http://localhost:3000")
		.allowedMethods("GET","POST","PUT","DELETE")
		.allowedHeaders("*")
		.allowCredentials(true)
		.maxAge(3600);
	}
	
}