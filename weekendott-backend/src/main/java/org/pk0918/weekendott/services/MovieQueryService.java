package org.pk0918.weekendott.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.AvailabilityBadgeDto;
import org.pk0918.weekendott.dto.MovieAvailabilityDto;
import org.pk0918.weekendott.dto.MovieCardDto;
import org.pk0918.weekendott.dto.MovieDetailsDto;
import org.pk0918.weekendott.entities.Genre;
import org.pk0918.weekendott.entities.Movie;
import org.pk0918.weekendott.entities.MovieAvailability;
import org.pk0918.weekendott.repositories.MovieAvailabilityRepository;
import org.pk0918.weekendott.repositories.MovieRepository;
import org.pk0918.weekendott.repositories.RatingRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MovieQueryService {
    private final MovieRepository movieRepo;
    private final MovieAvailabilityRepository availabilityRepo;
    private final RatingRepository ratingRepo;

    @Transactional
    public List<MovieCardDto> listMovies(String q, String platform, String language, String genre, int limit) {
        List<Movie> movies = (q != null && !q.isBlank())
                ? movieRepo.findByTitleContainingIgnoreCase(q)
                : movieRepo.findAll();

        if (genre != null && !genre.isBlank()) {
            movies = movieRepo.findByGenre(genre);
        }

        // Filter movies — when both platform and language are set, a single availability
        // row must satisfy BOTH conditions (e.g. Netflix AND Hindi on the same entry).
        // Checking them separately would pass a movie that has Netflix/Telugu + Prime/Hindi.
        boolean hasPlatform = platform != null && !platform.isBlank();
        boolean hasLanguage  = language  != null && !language.isBlank();

        if (hasPlatform || hasLanguage) {
            String p = hasPlatform ? platform.trim() : null;
            String l = hasLanguage  ? language.trim()  : null;
            movies = movies.stream()
                    .filter(m -> m.getAvailability().stream()
                            .anyMatch(ma -> {
                                boolean platformMatch = p == null || ma.getPlatform().getName().equalsIgnoreCase(p);
                                boolean languageMatch = l == null || ma.getLanguage().equalsIgnoreCase(l);
                                return platformMatch && languageMatch; // single row must satisfy both
                            }))
                    .toList();
        }

        return movies.stream()
                .limit(limit)
                .map(m -> toMovieCard(m, platform, language))
                .toList();
    }
    @Transactional
    public List<MovieCardDto> topRated(int limit) {
        return movieRepo.findAll().stream()
                .map(m -> toMovieCard(m, null, null))
                .filter(dto -> dto.avgRating() != null && dto.ratingCount() > 0)
                .sorted(Comparator.comparingDouble(MovieCardDto::avgRating).reversed())
                .limit(limit)
                .toList();
    }

    @Transactional
    public List<MovieCardDto> recentReleases(int limit) {
        // Fetch limit * 20 availability rows to ensure we have enough unique movies
        // after deduplication (a movie can have many rows — one per language per platform)
        var recent = availabilityRepo.findRecentReleases(PageRequest.of(0, limit * 20));

        Map<UUID, Movie> seen = new LinkedHashMap<>();
        for (var ma : recent) seen.putIfAbsent(ma.getMovie().getId(), ma.getMovie());

        return seen.values().stream()
                .limit(limit)
                .map(m -> toMovieCard(m, null, null))
                .toList();
    }
    public MovieDetailsDto getMovieDetails(UUID movieId) {
        Movie m  = movieRepo.findById(movieId).orElseThrow(() -> new RuntimeException("Movie not found"));

        Double avg = ratingRepo.getAverageRating(movieId);
        long count = ratingRepo.countByMovieId(movieId);

        var availability = availabilityRepo.findByMovieId(movieId).stream()
                .map(ma -> new MovieAvailabilityDto(
                        ma.getId(),
                        ma.getPlatform().getName(),
                        ma.getLanguage(),
                        ma.getOttReleaseDate()
                )).toList();

        var genres = m.getGenres().stream().map(Genre::getName).sorted().toList();
        return new MovieDetailsDto(
                m.getId(),
                m.getTitle(),
                m.getDescription(),
                m.getPosterUrl(),
                m.getReleaseYear(),
                genres,
                avg==null ? null : round2(avg),
                count,
                availability
        );
    }

    private MovieCardDto toMovieCard(Movie m, String platform, String language) {
        Double avg = ratingRepo.getAverageRating(m.getId());
        long count = ratingRepo.countByMovieId(m.getId());

        var badges = m.getAvailability().stream()
                .filter(ma -> platform == null || ma.getPlatform().getName().equalsIgnoreCase(platform))
                .filter(ma -> language == null || ma.getLanguage().equalsIgnoreCase(language))
                .sorted(Comparator.comparing(MovieAvailability::getOttReleaseDate).reversed())
                .limit(3)
                .map(ma -> new AvailabilityBadgeDto(
                        ma.getPlatform().getName(),
                        ma.getLanguage(),
                        ma.getOttReleaseDate()
                ))
                .toList();

        return new MovieCardDto(
                m.getId(),
                m.getTitle(),
                m.getPosterUrl(),
                m.getReleaseYear(),
                avg == null ? null : round2(avg),
                count,
                badges
        );
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}