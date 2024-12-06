package com.korea.moviestar.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.MovieEntity;

@Repository
public interface MovieRepository extends JpaRepository<MovieEntity, Integer>{

}
