package com.korea.moviestar.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.moviestar.dto.MovieDTO;
import com.korea.moviestar.dto.MovieThemeDTO;
import com.korea.moviestar.dto.NowPlayingDTO;
import com.korea.moviestar.dto.PopularDTO;
import com.korea.moviestar.dto.ResponseDTO;
import com.korea.moviestar.dto.ThemeDTO;
import com.korea.moviestar.dto.TopRatedDTO;
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
	
	@GetMapping("/popular")
	public ResponseEntity<?> getPopularMovies(){
		List<PopularDTO> dtos = service.getPopular();
		ResponseDTO<PopularDTO> response = ResponseDTO.<PopularDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	@GetMapping("/top_rated")
	public ResponseEntity<?> getTopRatedMovies(){
		List<TopRatedDTO> dtos = service.getTopRated();
		ResponseDTO<TopRatedDTO> response = ResponseDTO.<TopRatedDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	@GetMapping("/now_playing")
	public ResponseEntity<?> getNowPlayingMovies(){
		List<NowPlayingDTO> dtos = service.getNowplaying();
		ResponseDTO<NowPlayingDTO> response = ResponseDTO.<NowPlayingDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	@GetMapping("/theme/{themeId}")
	public ResponseEntity<?> getThemeMovies(@PathVariable int themeId){
		List<MovieThemeDTO> dtos = service.getThemeMovies(themeId);
		ResponseDTO<MovieThemeDTO> response = ResponseDTO.<MovieThemeDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
	
	@GetMapping("/video/{movieId}")
	public ResponseEntity<?> getVideoLink(@PathVariable int movieId){
		MovieDTO dto = service.getVideoPath(movieId);
		return ResponseEntity.ok().body(dto);
	}
	
	@GetMapping("/search")
	public ResponseEntity<?> search(@RequestParam String query){
		List<MovieDTO> dtos = service.searchMovies(query);
		ResponseDTO<MovieDTO> response = ResponseDTO.<MovieDTO>builder().data(dtos).build();
		return ResponseEntity.ok().body(response);
	}
}
