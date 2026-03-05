package org.pk0918.weekendott.controllers;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.AdminMovieRequest;
import org.pk0918.weekendott.dto.AdminMovieResponse;
import org.pk0918.weekendott.services.AdminMovieService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/movies")
@RequiredArgsConstructor
public class AdminMovieController {

    private final AdminMovieService adminMovieService;

    @GetMapping
    public Page<AdminMovieResponse> listMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminMovieService.listAll(page, size);
    }

    @GetMapping("/{id}")
    public AdminMovieResponse getMovie(@PathVariable UUID id) {
        return adminMovieService.getMovie(id);
    }

    @PostMapping
    public ResponseEntity<AdminMovieResponse> createMovie(
            @Valid @RequestBody AdminMovieRequest req
    ) {
        AdminMovieResponse created = adminMovieService.createMovie(req);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public AdminMovieResponse updateMovie(
            @PathVariable UUID id,
            @Valid @RequestBody AdminMovieRequest req
    ) {
        return adminMovieService.updateMovie(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(
            @PathVariable UUID id
    ) {
        adminMovieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}
