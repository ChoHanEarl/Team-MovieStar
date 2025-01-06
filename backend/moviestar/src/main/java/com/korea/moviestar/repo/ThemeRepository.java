package com.korea.moviestar.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.ThemeEntity;

@Repository
public interface ThemeRepository extends JpaRepository<ThemeEntity, Integer> {

}
