package com.korea.moviestar.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.PopularEntity;

import jakarta.transaction.Transactional;

@Repository
public interface PopularRepository extends JpaRepository<PopularEntity, Integer>{
	@Transactional
	  @Modifying
	  @Query(value = "truncate popular_movie", nativeQuery = true)
	  void truncatePopular();
}
