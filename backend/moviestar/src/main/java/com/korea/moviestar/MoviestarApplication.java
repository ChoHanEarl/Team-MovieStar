package com.korea.moviestar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MoviestarApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoviestarApplication.class, args);
	}
	
}
