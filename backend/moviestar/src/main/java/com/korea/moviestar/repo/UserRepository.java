package com.korea.moviestar.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.moviestar.entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer>{

	UserEntity findByUserName(String userName);
	boolean existsByUserName(String userName); // 아이디 중복 확인
	boolean existsByUserNick(String userNick); // 닉네임 중복 확인
	boolean existsByUserEmail(String userEmail); // 닉네임 중복 확인
	Optional<UserEntity> findByUserEmail(String email); //유저 이메일로 아이디찾기

}
