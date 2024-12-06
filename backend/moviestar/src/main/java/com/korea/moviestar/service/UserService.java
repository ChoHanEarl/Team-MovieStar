package com.korea.moviestar.service;

import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import com.korea.moviestar.dto.UserDTO;
import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.UserEntity;
import com.korea.moviestar.repo.MovieRepository;
import com.korea.moviestar.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository repository;
	private final MovieRepository movies;
	
	public List<UserDTO> findAll(){
		List<UserEntity> entities = repository.findAll();
		return entities.stream().map(UserDTO::new).collect(Collectors.toList());
	}

	public UserDTO createUser(UserDTO dto) {
		dto.setUserLikeList(new HashSet<Integer>());
		UserEntity entity = repository.save(UserService.toEntity(dto, movies));
		UserDTO response = UserDTO.builder()
			.userId(entity.getUserId())
			.userEmail(entity.getUserEmail())
			.userNick(entity.getUserNick())
			.userName(entity.getUserName())
			.build();
		return response;
	}
	
	public UserDTO findByUserId(int userId) {
		Optional<UserEntity> origin = repository.findById(userId);
		if(origin.isPresent()) {
			UserEntity entity = origin.get();
			UserDTO response = UserDTO.builder()
					.userId(entity.getUserId())
					.userEmail(entity.getUserEmail())
					.userNick(entity.getUserNick())
					.userName(entity.getUserName())
					.userLikeList( entity.getUserLikeList().stream().map(movie -> movie.getMovieId()).collect(Collectors.toSet()))
					.build();
			return response;
		}
		return null;
	}
	
	public UserDTO findUser(UserDTO dto, final PasswordEncoder encoder) {
		UserEntity origin = repository.findByUserName(dto.getUserName());
		if(origin != null && encoder.matches(dto.getUserPwd(), origin.getUserPwd())) {
			return new UserDTO(origin);
		}else {
			return null;
		}
	}
	
	public UserDTO addLike(String userId, int movieId) {
		int user = Integer.parseInt(userId);
		Optional<UserEntity> origin = repository.findById(user);
		if(origin.isPresent()) {
			UserEntity entity = origin.get();
			Set<MovieEntity> newList = entity.getUserLikeList();
			newList.add(movies.findById(movieId).get());
			entity.setUserLikeList(newList);
			return new UserDTO(repository.save(entity));
		}else {
			return null;
		}
	}
	
	public UserDTO deleteLike(String userId, int movieId) {
		int user = Integer.parseInt(userId);
		Optional<UserEntity> origin = repository.findById(user);
		if(origin.isPresent()) {
			UserEntity entity = origin.get();
			Set<MovieEntity> newList = entity.getUserLikeList();
			newList.remove(movies.findById(movieId).get());
			entity.setUserLikeList(newList);
			return new UserDTO(repository.save(entity));
		}else {
			return null;
		}
	}
	
	public UserDTO update(UserDTO dto) {
		Optional<UserEntity> origin = repository.findById(dto.getUserId());
		if(origin.isPresent()) {
			UserEntity entity = origin.get();
			entity.setUserName(dto.getUserName());
			entity.setUserNick(dto.getUserNick());
			entity.setUserEmail(dto.getUserEmail());
			entity.setUserPwd(dto.getUserPwd());
			return new UserDTO(repository.save(entity));
		}
		return null;
	}
	
	public static UserEntity toEntity(UserDTO dto, MovieRepository movies) {
		return UserEntity.builder()
					.userId(dto.getUserId())
					.userNick(dto.getUserNick())
					.userName(dto.getUserName())
					.userEmail(dto.getUserEmail())
					.userPwd(dto.getUserPwd())
					.userLikeList(dto.getUserLikeList().stream().map(movies::findById).filter(Optional::isPresent).map(Optional::get).collect(Collectors.toSet()))
					.build();
	}
}
