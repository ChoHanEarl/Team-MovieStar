package com.korea.moviestar.dto;

import com.korea.moviestar.entity.MovieThemeEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieThemeDTO {
	private int id;
	private int movieId;
	private int themeId;
	private int movieRank;
	private String movieName;
	private String moviePoster;
	
	public MovieThemeDTO(MovieThemeEntity entity) {
		this.id = entity.getId();
		this.movieId = entity.getMovie().getMovieId();
		this.themeId = entity.getTheme().getThemeId();
		this.movieRank = entity.getMovieRank();
		this.movieName = entity.getMovie().getMovieName();
		this.moviePoster = entity.getMovie().getMoviePoster();
	}
}
