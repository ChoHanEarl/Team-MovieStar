package com.korea.moviestar.dto;

import java.util.List;
import java.util.Set;

import com.korea.moviestar.entity.UserEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	private int userId;
	private String userName;
	private String userNick;
	private String userEmail;
	private String userPwd;
	private Set<Integer> userLikeList;

	private String token;

	
	public UserDTO(UserEntity entity) {
		this.userId = entity.getUserId();
		this.userNick = entity.getUserNick();
		this.userName = entity.getUserName();
		this.userEmail = entity.getUserEmail();
		this.userPwd = entity.getUserPwd();
		this.userLikeList = entity.getUserLikeList();
	}
	
	public static UserEntity toEntity(UserDTO dto) {
		return UserEntity.builder()
					.userId(dto.getUserId())
					.userNick(dto.getUserNick())
					.userName(dto.getUserName())
					.userEmail(dto.getUserEmail())
					.userPwd(dto.getUserPwd())
					.userLikeList(dto.getUserLikeList())
					.build();
	}
}
