package com.korea.moviestar.service;

import java.util.HashSet;
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
		// 아이디 중복 확인
		if (repository.existsByUserName(dto.getUserName())) {
			throw new RuntimeException("이미 사용 중인 아이디입니다.");
		}
		
		// 닉네임 중복 확인
		if (repository.existsByUserNick(dto.getUserNick())) {
			throw new RuntimeException("이미 사용 중인 닉네임입니다.");
		}
		
		//이메일 중복 확인
		if(repository.existsByUserEmail(dto.getUserEmail())) {
			throw new RuntimeException("이미 사용 중인 이메일입니다.");
		}
		
		// 중복 검사 통과 시 사용자 저장
		dto.setUserLikeList(new HashSet<Integer>());
		UserEntity entity = repository.save(UserService.toEntity(dto, movies));
		UserDTO response = new UserDTO(entity);
		return response.hidePwd();
	}

	public UserDTO findByEmail(String email) {
	    UserEntity user = repository.findByUserEmail(email)
	        .orElseThrow(() -> new RuntimeException(email+"해당 이메일로 등록된 사용자를 찾을 수 없습니다."));
	    return UserDTO.fromEntity(user).hidePwd();
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
					.userLikeList(entity.getUserLikeList().stream().map(movie -> movie.getMovieId()).collect(Collectors.toSet()))
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
			return new UserDTO(repository.save(entity)).hidePwd();
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
			return new UserDTO(repository.save(entity)).hidePwd();
		}else {
			return null;
		}
	}
	
	public UserDTO update(UserDTO dto) {
		Optional<UserEntity> origin = repository.findById(dto.getUserId());
		if(origin.isPresent()) {
			UserEntity entity = origin.get();
			// 아이디 중복 확인
			if (!dto.getUserName().equals(entity.getUserName()) && repository.existsByUserName(dto.getUserName()) ) {
				throw new RuntimeException("이미 사용 중인 아이디입니다.");
			}
			
			// 닉네임 중복 확인
			if (!dto.getUserNick().equals(entity.getUserNick()) &&repository.existsByUserNick(dto.getUserNick())) {
				throw new RuntimeException("이미 사용 중인 닉네임입니다.");
			}
			
			//이메일 중복 확인
			if(!dto.getUserEmail().equals(entity.getUserEmail()) &&repository.existsByUserEmail(dto.getUserEmail())) {
				throw new RuntimeException("이미 사용 중인 이메일입니다.");
			}
			
			entity.setUserName(dto.getUserName());
			entity.setUserNick(dto.getUserNick());
			entity.setUserEmail(dto.getUserEmail());
			return new UserDTO(repository.save(entity)).hidePwd();
		}
		return null;
	}
	
	public UserDTO updatePwd(String userEmail, String newPwd) {
		UserDTO dto = findByEmail(userEmail);
		dto.setUserPwd(newPwd);
		return new UserDTO(repository.save(toEntity(dto, movies))).hidePwd();
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
