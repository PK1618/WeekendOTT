package org.pk0918.weekendott.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.RatingResponseDto;
import org.pk0918.weekendott.entities.Movie;
import org.pk0918.weekendott.entities.Rating;
import org.pk0918.weekendott.repositories.MovieRepository;
import org.pk0918.weekendott.repositories.RatingRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final MovieRepository movieRepo;
    private final RatingRepository ratingRepo;

    @Transactional
    public RatingResponseDto upsertRating(UUID movieId, UUID userId, int score) {
        Movie movie = movieRepo.findById(movieId).orElseThrow(() -> new RuntimeException("Movie not found"));

        Rating rating = ratingRepo.findByUserIdAndMovieId(userId, movieId).orElseGet(Rating::new);

        rating.setUserId(userId);
        rating.setMovie(movie);
        rating.setScore(score);

        ratingRepo.save(rating);

        Double avg = ratingRepo.getAverageRating(movieId);
        Long count = ratingRepo.countByMovieId(movieId);

        return new RatingResponseDto(avg == null ? null : round2(avg), count);
    }
    public Integer getUserRating(UUID movieId, UUID userId) {
        return ratingRepo.findByUserIdAndMovieId(userId, movieId)
                .map(Rating::getScore)
                .orElse(null);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}