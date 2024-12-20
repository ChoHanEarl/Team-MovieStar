package com.korea.moviestar.dto;

import com.korea.moviestar.entity.TopRatedEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopRatedDTO {
	private int id;
	private int movieId;
	
	public TopRatedDTO(TopRatedEntity entity) {
		this.id = entity.getId();
		this.movieId = entity.getMovie().getMovieId();
	}
}
