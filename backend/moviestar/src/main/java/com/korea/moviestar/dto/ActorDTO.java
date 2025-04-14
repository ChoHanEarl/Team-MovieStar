package com.korea.moviestar.dto;

import com.korea.moviestar.entity.ActorEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActorDTO {
	private String actorName;
	private String actorImage;
	private String actorRole;
	
	public ActorDTO(ActorEntity entity) {
		this.actorRole = entity.getActorRole();
		this.actorName = entity.getActorName();
		this.actorImage = entity.getActorImage();
	}
}
