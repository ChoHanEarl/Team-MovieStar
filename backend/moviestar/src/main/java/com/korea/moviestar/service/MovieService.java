package com.korea.moviestar.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.korea.moviestar.dto.MovieDTO;
import com.korea.moviestar.dto.MovieThemeDTO;
import com.korea.moviestar.dto.NowPlayingDTO;
import com.korea.moviestar.dto.PopularDTO;
import com.korea.moviestar.dto.TopRatedDTO;
import com.korea.moviestar.dto.UserDTO;
import com.korea.moviestar.entity.ActorEntity;
import com.korea.moviestar.entity.MovieEntity;
import com.korea.moviestar.entity.MovieThemeEntity;
import com.korea.moviestar.entity.NowPlayingEntity;
import com.korea.moviestar.entity.PopularEntity;
import com.korea.moviestar.entity.ThemeEntity;
import com.korea.moviestar.entity.TopRatedEntity;
import com.korea.moviestar.repo.MovieRepository;
import com.korea.moviestar.repo.MovieThemeRepository;
import com.korea.moviestar.repo.NowPlayingRepository;
import com.korea.moviestar.repo.PopularRepository;
import com.korea.moviestar.repo.ThemeRepository;
import com.korea.moviestar.repo.TopRatedRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieService {
	@Value("${tmdb.api.key}")
	private String apiKey;

	private final RestTemplate restTemplate = new RestTemplate();
	private final String BASE_URL = "https://api.themoviedb.org/3";

	private final MovieRepository movies;
	private final ThemeRepository themes;
	private final PopularRepository populars;
	private final TopRatedRepository topRates;
	private final NowPlayingRepository nowPlayings;
	private final MovieThemeRepository movieThemes;

	public List<ThemeEntity> themeList() {

		return themes.findAll();
	}

	@Transactional
	public List<ThemeEntity> getThemes() {
		Map<String, Object> response = restTemplate
				.getForObject(BASE_URL + "/genre/movie/list?api_key=" + apiKey + "&language=ko-KR", Map.class);

		if (response == null) {
			return null;
		}

		List<Map<String, Object>> genres = (List<Map<String, Object>>) response.get("genres");
		for (Map<String, Object> genre : genres) {
			int id = (int) genre.get("id");
			String name = (String) genre.get("name");

			if (!themes.existsById(id)) {
				themes.save(ThemeEntity.builder().themeId(id).themeName(name).build());
			}
		}
		return themeList();
	}

	@Transactional
	public MovieEntity getMovie(int movieId) {
		if (movies.findById(movieId).isPresent()) {
			return movies.findById(movieId).get(); // 만약 존재하면 그대로 반환
		}
		Map<String, Object> response = restTemplate
				.getForObject(BASE_URL + "/movie/" + movieId + "?api_key=" + apiKey + "&language=ko-KR", Map.class);

		if (response == null) {
			return null; // 데이터가 없을 때 빈 리스트 반환
		}

		List<Map<String, Object>> genres = (List<Map<String, Object>>) response.get("genres");

		Map<String, Object> creditResponse = restTemplate.getForObject(
				BASE_URL + "/movie/" + movieId + "/credits?api_key=" + apiKey + "&language=ko-KR", Map.class);

		if (creditResponse == null) {
			return null;
		}

		List<Map<String, Object>> actorList = (List<Map<String, Object>>) creditResponse.get("cast");
		List<ActorEntity> actorEntities = actorList.stream()
				.map(actor -> ActorEntity.builder().actorName((String) actor.get("name"))
						.actorRole((String) actor.get("character")).actorImage((String) actor.get("profile_path"))
						.build())
				.collect(Collectors.toList());

		MovieEntity entity = MovieEntity.builder().movieId(movieId).movieName((String) response.get("title"))
				.movieOpDate((String) response.get("release_date")).movieScore((double) response.get("vote_average"))
				.moviePoster((String) response.get("poster_path")).movieOverview((String) response.get("overview"))
				.movieBackdrop((String) response.get("backdrop_path")).movieActors(actorEntities).build();

		Set<MovieThemeEntity> themeEntities = genres.stream().map(genre -> {
			ThemeEntity theme = ThemeEntity.builder().themeId((Integer) genre.get("id"))
					.themeName((String) genre.get("name")).build();
			return MovieThemeEntity.builder().movie(entity).theme(theme).build();
		}).collect(Collectors.toSet());

		entity.setMovieThemes(themeEntities);
		return movies.save(entity);

	}

	// 1시간마다 자동 갱신
	@Scheduled(cron = "0 0 0/1 * * *")
	@Transactional
	public List<PopularDTO> saveAndGetPopular() {
		populars.truncatePopular();// 테이블 비우기

		Map<String, Object> response = restTemplate
				.getForObject(BASE_URL + "/movie/popular?api_key=" + apiKey + "&language=ko-KR", Map.class);

		if (response == null || response.get("results") == null) {
			return null;
		}

		List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

		if (results.isEmpty()) {
			return null;
		}

		// 병렬(비동기) 처리
		List<CompletableFuture<PopularEntity>> futures = results.stream()
				.map(movie -> CompletableFuture.supplyAsync(() -> {
					int movieId = (int) movie.get("id");
					return PopularEntity.builder().movie(getMovie(movieId)).build();
				})).collect(Collectors.toList());

		List<PopularEntity> popEntities = futures.stream().map(CompletableFuture::join).collect(Collectors.toList());

		populars.saveAll(popEntities);

		return getPopular();
	}

	public List<PopularDTO> getPopular() {
		List<PopularEntity> entities = populars.findAll();
		return entities.stream().map(PopularDTO::new).collect(Collectors.toList());
	}

	// 1시간마다 자동 갱신
	@Scheduled(cron = "0 2 0/1 * * *")
	@Transactional
	public List<TopRatedDTO> saveAndGetTopRated() {
		topRates.truncateTopRated(); // 테이블 비우기

		Map<String, Object> response = restTemplate
				.getForObject(BASE_URL + "/movie/top_rated?api_key=" + apiKey + "&language=ko-KR", Map.class);

		if (response == null || response.get("results") == null) {
			return null;
		}

		List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

		if (results.isEmpty()) {
			return null;
		}

		// 병렬(비동기) 처리
		List<CompletableFuture<TopRatedEntity>> futures = results.stream()
				.map(movie -> CompletableFuture.supplyAsync(() -> {
					int movieId = (int) movie.get("id");
					return TopRatedEntity.builder().movie(getMovie(movieId)).build();
				})).collect(Collectors.toList());

		List<TopRatedEntity> topEntities = futures.stream().map(CompletableFuture::join).collect(Collectors.toList());

		topRates.saveAll(topEntities);

		return getTopRated();
	}

	public List<TopRatedDTO> getTopRated() {

		List<TopRatedEntity> entities = topRates.findAll();

		return entities.stream().map(TopRatedDTO::new).collect(Collectors.toList());
	}

	// 1시간마다 자동 갱신
	@Scheduled(cron = "0 3 0/1 * * *")
	@Transactional
	public List<NowPlayingDTO> saveAndGetNowPlaying() {
		nowPlayings.truncateNowPlaying();

		Map<String, Object> response = restTemplate
				.getForObject(BASE_URL + "/movie/now_playing?api_key=" + apiKey + "&language=ko-KR", Map.class);

		if (response == null || response.get("results") == null) {
			return null;
		}

		List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

		if (results.isEmpty()) {
			return null;
		}

		List<CompletableFuture<NowPlayingEntity>> futures = results.stream()
				.map(movie -> CompletableFuture.supplyAsync(() -> {
					int movieId = (int) movie.get("id");
					return NowPlayingEntity.builder().movie(getMovie(movieId)).build();
				})).collect(Collectors.toList());

		List<NowPlayingEntity> nowEntities = futures.stream().map(CompletableFuture::join).collect(Collectors.toList());

		nowPlayings.saveAll(nowEntities);

		return getNowplaying();
	}

	public List<NowPlayingDTO> getNowplaying() {
		List<NowPlayingEntity> entities = nowPlayings.findAll();

		return entities.stream().map(NowPlayingDTO::new).collect(Collectors.toList());
	}

	public List<MovieThemeDTO> getAndSaveThemeMovies(int themeId) {

		ThemeEntity theme = themes.findById(themeId).get();
		Set<Integer> updatedMovieIds = new HashSet<>();

		Map<String, Object> response = restTemplate.getForObject(BASE_URL + "/discover/movie?api_key=" + apiKey
				+ "&language=ko-KR&page=1&sort_by=popularity.desc&with_genres=" + themeId, Map.class);

		if (response == null || response.get("results") == null) {
			return null;
		}

		List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

		if (results.isEmpty()) {
			return null;
		}

		AtomicInteger rank = new AtomicInteger(1);
		List<CompletableFuture<MovieThemeEntity>> futures = results.stream()
				.map(item -> CompletableFuture.supplyAsync(() -> {
					int movieId = (int) item.get("id");
					updatedMovieIds.add(movieId);
					int currentRank = rank.getAndIncrement();

					MovieEntity movie = getMovie(movieId);

					MovieThemeEntity existingEntity = movieThemes.findByMovieAndTheme(movie, theme);

					if (existingEntity != null) {
						existingEntity.setMovieRank(currentRank);
						return existingEntity;
					} else {
						return MovieThemeEntity.builder().movie(movie).theme(theme).movieRank(currentRank).build();
					}
				})).collect(Collectors.toList());

		List<MovieThemeEntity> mtEntities = futures.stream().map(CompletableFuture::join).collect(Collectors.toList());

		return saveEntities(mtEntities, theme, updatedMovieIds);

	}

	@Transactional
	public List<MovieThemeDTO> saveEntities(List<MovieThemeEntity> mtEntities, ThemeEntity theme,
			Set<Integer> updatedMovieIds) {
		movieThemes.saveAll(mtEntities);
		movieThemes.clearOldRanks(theme, updatedMovieIds);
		return getThemeMovies(theme.getThemeId());
	}

	public List<MovieThemeDTO> getThemeMovies(int themeId) {
		List<MovieThemeEntity> entities = movieThemes.findAllByTheme(themes.findById(themeId).get());
		return entities.stream().map(MovieThemeDTO::new).collect(Collectors.toList());
	}

	@Scheduled(cron = "0 10 0/1 * * *")
	public void getAndSaveAllThemeMovies() {
		getThemes();
		List<ThemeEntity> entities = themes.findAll();
		for (ThemeEntity theme : entities) {
			getAndSaveThemeMovies(theme.getThemeId());
		}
	}

	public MovieDTO getVideoPath(int movieId) {
		MovieEntity movie = getMovie(movieId);

		Map<String, Object> response = restTemplate.getForObject(
				BASE_URL + "/movie/" + movieId + "/videos?api_key=" + apiKey + "&language=ko-KR", Map.class);

		if (response == null || response.get("results") == null) {
			return null;
		}

		List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

		if (results.isEmpty()) {
			return null;
		}

		String key = (String) results.get(0).get("key");
		movie.setMovieVideo(key);
		return new MovieDTO(movies.save(movie));
	}

	public List<MovieDTO> searchMovies(String query) {

		Map<String, Object> response = restTemplate.getForObject(
				BASE_URL + "/search/movie?api_key=" + apiKey + "&query=" + query + "&page=1&language=ko-KR", Map.class);
		if (response == null || response.get("results") == null) {
			return null;
		}
		
		List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
		if (results.isEmpty()) {
			return null;
		}
		
		List<CompletableFuture<MovieDTO>> futures = results.stream()
				.map(movie -> CompletableFuture.supplyAsync(() -> {
					int movieId = (int) movie.get("id");
					String poster = (String) movie.get("poster_path");
					String title = (String) movie.get("title");
					getMovie(movieId);
					return MovieDTO.builder().movieId(movieId).movieName(title).moviePoster(poster).build();
				})).collect(Collectors.toList());
		
		return futures.stream().map(CompletableFuture::join).collect(Collectors.toList());
	}

}
