package com.korea.moviestar.entity;

import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
@Table(name = "movie")
public class MovieEntity {
	@Id
	int movieId;
	String movieName;
	@ManyToMany
	@JoinTable(
			name = "movie_theme_table",
			joinColumns = @JoinColumn(name="movie_id"),
			inverseJoinColumns = @JoinColumn(name = "theme_id")
	)
	Set<ThemeEntity> movieTheme;
	String movieOpDate;
	double movieScore;
	String moviePoster;
	@Column(length = 65535)
	String movieOverview;
}
