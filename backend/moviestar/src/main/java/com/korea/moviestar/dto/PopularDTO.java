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
	
	public PopularDTO(PopularEntity entity) {
		this.id = entity.getId();
		this.movieId = entity.getMovie().getMovieId();
	}
}
