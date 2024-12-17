package com.korea.moviestar.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.NowPlayingEntity;

import jakarta.transaction.Transactional;

@Repository
public interface NowPlayingRepository extends JpaRepository<NowPlayingEntity, Integer>{
	@Transactional
	@Modifying
	@Query(value = "truncate now_playing_movie", nativeQuery = true)
	void truncateNowPlaying();
}
