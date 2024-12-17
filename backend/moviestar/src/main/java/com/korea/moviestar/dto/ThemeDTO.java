package com.korea.moviestar.dto;


import com.korea.moviestar.entity.ThemeEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeDTO {
	private int themeId;
	private String themeName;
	
	public ThemeDTO(ThemeEntity entity) {
		this.themeId = entity.getThemeId();
		this.themeName = entity.getThemeName();
	}
	
	public static ThemeEntity toEntity(ThemeDTO dto) {
		return ThemeEntity.builder().themeId(dto.getThemeId()).themeName(dto.getThemeName()).build();
	}
}
