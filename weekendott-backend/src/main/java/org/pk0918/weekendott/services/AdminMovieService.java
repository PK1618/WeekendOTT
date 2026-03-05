package org.pk0918.weekendott.services;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.AdminMovieRequest;
import org.pk0918.weekendott.dto.AdminMovieResponse;
import org.pk0918.weekendott.entities.Genre;
import org.pk0918.weekendott.entities.Movie;
import org.pk0918.weekendott.entities.MovieAvailability;
import org.pk0918.weekendott.entities.Platform;
import org.pk0918.weekendott.repositories.GenreRepository;
import org.pk0918.weekendott.repositories.MovieAvailabilityRepository;
import org.pk0918.weekendott.repositories.MovieRepository;
import org.pk0918.weekendott.repositories.PlatformRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminMovieService {

    private final MovieRepository movieRepo;
    private final GenreRepository genreRepo;
    private final PlatformRepository platformRepo;
    private final MovieAvailabilityRepository availabilityRepo;

    public Page<AdminMovieResponse> listAll(int page, int size) {
        return movieRepo
                .findAll(PageRequest.of(page, size, Sort.by("title").ascending()))
                .map(this::toResponse);
    }

    //Create
    @Transactional
    public AdminMovieResponse createMovie(AdminMovieRequest req) {
        Movie movie = new Movie();
        applyFields(movie, req);
        Movie saved = movieRepo.save(movie);
        applyAvailability(saved, req);
        return toResponse(movieRepo.findById(saved.getId()).orElseThrow());
    }

    //Update
    @Transactional
    public AdminMovieResponse updateMovie(UUID id, AdminMovieRequest req) {
        Movie movie = movieRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found: " + id));
        applyFields(movie, req);

        availabilityRepo.deleteAll(movie.getAvailability());
        movie.getAvailability().clear();
        movieRepo.save(movie);
        applyAvailability(movie, req);

        return toResponse(movieRepo.findById(id).orElseThrow());
    }

    //Delete
    @Transactional
    public void deleteMovie(UUID id) {
        Movie movie = movieRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found: " + id));
        movieRepo.delete(movie);
    }

    //get single
    public AdminMovieResponse getMovie(UUID id) {
        return toResponse(movieRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found: " + id)));
    }

    //helper functions
    private void applyFields(Movie movie, AdminMovieRequest req) {
        movie.setTitle(req.title());
        movie.setDescription(req.description());
        movie.setReleaseYear(req.releaseYear());

        if(req.genres() != null) {
            var genres = new HashSet<Genre>();
            for(String name : req.genres()) {
                Genre genre = genreRepo.findByNameIgnoreCase(name.trim()).orElseGet(() -> {
                    Genre g = new Genre();
                    g.setName(name.trim());
                    return genreRepo.save(g);
                });
                genres.add(genre);
            }
            movie.setGenres(genres);
        }
    }

    private void applyAvailability(Movie movie, AdminMovieRequest req) {
        if(req.availability() == null || req.availability().isEmpty()) return;

        for(AdminMovieRequest.AvailabilityEntry entry : req.availability()) {

            Platform platform = platformRepo.findByNameIgnoreCase(entry.platform().trim()).orElseGet(() -> {
                Platform p = new Platform();
                p.setName(entry.platform().trim());
                return platformRepo.save(p);
            });

            MovieAvailability ma = new MovieAvailability();
            ma.setMovie(movie);
            ma.setPlatform(platform);
            ma.setLanguage(entry.language().trim());
            ma.setOttReleaseDate(entry.ottReleaseDate());
            availabilityRepo.save(ma);
        }
    }

    private AdminMovieResponse toResponse(Movie m) {
        List<String> genres = m.getGenres().stream()
                .map(Genre::getName)
                .sorted()
                .toList();

        List<AdminMovieResponse.AvailabilityEntry> availability = m.getAvailability().stream()
                .map(ma -> new AdminMovieResponse.AvailabilityEntry(
                        ma.getId(),
                        ma.getPlatform().getName(),
                        ma.getLanguage(),
                        ma.getOttReleaseDate()
                )).toList();

        return new AdminMovieResponse(
                m.getId(),
                m.getTitle(),
                m.getDescription(),
                m.getPosterUrl(),
                m.getReleaseYear(),
                genres,
                availability
        );
    }
}
