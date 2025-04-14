package com.korea.moviestar.dto;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.ThemeEntity;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MovieDTO {
	private int movieId;
	private String movieName;
	private Set<Integer> movieTheme;
	private String movieOpDate;
	private double movieScore;
	private String moviePoster;
	private String movieBackdrop;
	private String movieVideo;
	private String movieOverview;
	private List<ActorDTO> movieActors;
	
	public MovieDTO(MovieEntity entity) {
		this.movieId = entity.getMovieId();
		this.movieName = entity.getMovieName();
		this.movieTheme = entity.getMovieThemes().stream().map(theme -> theme.getTheme().getThemeId()).collect(Collectors.toSet());
		this.movieOpDate = entity.getMovieOpDate();
		this.movieScore = entity.getMovieScore();
		this.moviePoster = entity.getMoviePoster();
		this.movieOverview = entity.getMovieOverview();
		this.movieVideo = entity.getMovieVideo();
		this.movieBackdrop = entity.getMovieBackdrop();
		this.movieActors = entity.getMovieActors().stream().map(ActorDTO::new).collect(Collectors.toList());
	}
}
