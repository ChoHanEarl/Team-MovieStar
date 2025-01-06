package com.korea.moviestar.dto;

import com.korea.moviestar.entity.PopularEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularDTO {
	private int id;
	private int movieId;
	private String movieName;
	private String moviePoster;
	private String movieBackdrop;
	private String movieOverview;
	
	public PopularDTO(PopularEntity entity) {
		this.id = entity.getId();
		this.movieId = entity.getMovie().getMovieId();
		this.movieName = entity.getMovie().getMovieName();
		this.moviePoster = entity.getMovie().getMoviePoster();
		this.movieBackdrop = entity.getMovie().getMovieBackdrop();
		this.movieOverview = entity.getMovie().getMovieOverview();
	}
}
