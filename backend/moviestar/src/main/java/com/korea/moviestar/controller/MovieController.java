package com.korea.moviestar.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.moviestar.dto.MovieDTO;
import com.korea.moviestar.dto.ResponseDTO;
import com.korea.moviestar.dto.ThemeDTO;
import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.ThemeEntity;
import com.korea.moviestar.service.MovieService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/movie")
public class MovieController {
	private final MovieService service;
	
	@GetMapping("/themes")
	public ResponseEntity<?> saveThemes(){
		List<ThemeEntity> entities = service.getThemes();
		List<ThemeDTO> dtos = entities.stream().map(ThemeDTO::new).collect(Collectors.toList());
		ResponseDTO<ThemeDTO> response = ResponseDTO.<ThemeDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	@GetMapping("/{movieId}")
	public ResponseEntity<?> getOneMovie(@PathVariable int movieId){
		MovieDTO response = new MovieDTO(service.getMovie(movieId));
		return ResponseEntity.ok().body(response);
	}
}
