package com.korea.moviestar.repo;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.MailVerificationEntity;

import jakarta.transaction.Transactional;

@Repository
public interface MailVerificationRepository extends JpaRepository<MailVerificationEntity, Integer>{
	Optional<MailVerificationEntity> findByEmail(String email);
	
	@Modifying
    @Transactional
    @Query("DELETE FROM MailVerificationEntity e WHERE e.expiresAt < :now")
    void deleteExpiredEntities(@Param("now") LocalDateTime now);
}
