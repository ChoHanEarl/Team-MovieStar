package com.korea.moviestar.repo;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.MovieThemeEntity;
import com.korea.moviestar.entity.ThemeEntity;

import jakarta.transaction.Transactional;

@Repository
public interface MovieThemeRepository extends JpaRepository<MovieThemeEntity, Integer>{
	@Transactional
	@Modifying
	@Query(value = "UPDATE MovieThemeEntity mt SET mt.movieRank = 0 WHERE mt.theme = :theme AND mt.movie.movieId NOT IN :updatedIds")
	public void clearOldRanks(@Param("theme") ThemeEntity theme, @Param("updatedIds") Set<Integer> updatedIds);
	
	@Query("SELECT mt FROM MovieThemeEntity mt WHERE mt.theme = :theme AND mt.movieRank > 0")
    public List<MovieThemeEntity> findAllByTheme(@Param("theme") ThemeEntity theme);
	
	public MovieThemeEntity findByMovieAndTheme(MovieEntity movie, ThemeEntity theme);
}
