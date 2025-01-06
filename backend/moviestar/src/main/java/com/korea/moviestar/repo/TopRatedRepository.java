package com.korea.moviestar.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.TopRatedEntity;

import jakarta.transaction.Transactional;

@Repository
public interface TopRatedRepository extends JpaRepository<TopRatedEntity, Integer>{
	@Transactional
	  @Modifying
	  @Query(value = "truncate top_rated_movie", nativeQuery = true)
	  void truncateTopRated();
}
