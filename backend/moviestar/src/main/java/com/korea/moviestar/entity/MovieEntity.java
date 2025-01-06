package com.korea.moviestar.entity;

import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
@Table(name = "movie")
public class MovieEntity {
	@Id
	private int movieId;
	private String movieName;
	
	@OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
	private Set<MovieThemeEntity> movieThemes;
	
	private String movieOpDate;
	private double movieScore;
	private String moviePoster;
	private String movieVideo;
	private String movieBackdrop;
	@Column(length = 65535, columnDefinition = "TEXT")
	private String movieOverview;
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "movie_id")
	private List<ActorEntity> movieActors;
	
}
