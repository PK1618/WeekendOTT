package org.pk0918.weekendott.controllers;

import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.MovieCardDto;
import org.pk0918.weekendott.dto.MovieDetailsDto;
import org.pk0918.weekendott.services.MovieQueryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieQueryService movieQueryService;

    @GetMapping
    public List<MovieCardDto> listMovies(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return movieQueryService.listMovies(q, platform, language, genre, limit);
    }

    @GetMapping("/recent")
    public List<MovieCardDto> recent(@RequestParam(defaultValue = "20") int limit) {
        return movieQueryService.recentReleases(limit);
    }

    @GetMapping("/{id}")
    public MovieDetailsDto details(@PathVariable UUID id) {
        return movieQueryService.getMovieDetails(id);
    }
}
