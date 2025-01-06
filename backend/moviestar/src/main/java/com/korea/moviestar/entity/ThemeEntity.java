package com.korea.moviestar.entity;

import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "theme")
public class ThemeEntity {
	@Id
	private int themeId;
	private String themeName;
	
	@OneToMany(mappedBy = "theme", cascade = CascadeType.ALL)
    private Set<MovieThemeEntity> movieThemes;
}
