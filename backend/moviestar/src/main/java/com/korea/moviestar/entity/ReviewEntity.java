package com.korea.moviestar.entity;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "review")
public class ReviewEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private int reviewId;
	private int movieId;
	@ManyToOne(cascade = CascadeType.REMOVE)
	@JoinColumn(name="user_id")
	private UserEntity user;
	private int reviewRating;
	private String reviewContent;
	@CreationTimestamp
	private Date reviewDate;
}
