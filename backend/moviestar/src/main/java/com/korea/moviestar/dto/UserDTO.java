package com.korea.moviestar.dto;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

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

    // 기존 생성자
    public UserDTO(UserEntity entity) {
        this.userId = entity.getUserId();
        this.userNick = entity.getUserNick();
        this.userName = entity.getUserName();
        this.userEmail = entity.getUserEmail();
        this.userPwd = entity.getUserPwd();
        this.userLikeList = entity.getUserLikeList() != null
                ? entity.getUserLikeList().stream()
                    .map(movie -> movie.getMovieId())
                    .collect(Collectors.toSet())
                : new HashSet<>();
    }
    
    // Entity를 DTO로 변환하는 정적 메서드 추가
    public static UserDTO fromEntity(UserEntity entity) {
        return UserDTO.builder()
            .userId(entity.getUserId())
            .userName(entity.getUserName())
            .userNick(entity.getUserNick())
            .userEmail(entity.getUserEmail())
            .userPwd(entity.getUserPwd())
            .userLikeList(entity.getUserLikeList() != null
                ? entity.getUserLikeList().stream()
                    .map(movie -> movie.getMovieId())
                    .collect(Collectors.toSet())
                : new HashSet<>())
            .build();
    }
    
    //비밀번호를 가리는 메서드
    public UserDTO hidePwd() {
        this.userPwd = null;
        return this;
    }
}