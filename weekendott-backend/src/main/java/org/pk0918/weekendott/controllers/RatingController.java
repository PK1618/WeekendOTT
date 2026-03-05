package org.pk0918.weekendott.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.RatingRequestDto;
import org.pk0918.weekendott.dto.RatingResponseDto;
import org.pk0918.weekendott.security.UserPrincipal;
import org.pk0918.weekendott.services.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/movies/{movieId}/rating")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    // POST — submit or update rating (requires auth)
    @PostMapping
    public ResponseEntity<?> rate(
            @PathVariable UUID movieId,
            @Valid @RequestBody RatingRequestDto req
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(ratingService.upsertRating(movieId, user.getId(), req.score()));
    }

    // GET /mine — returns the current user's rating for this movie, or null if not rated
    @GetMapping("/mine")
    public ResponseEntity<?> myRating(@PathVariable UUID movieId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            return ResponseEntity.ok(Map.of("score", (Object) null));
        }
        Integer score = ratingService.getUserRating(movieId, user.getId());
        return ResponseEntity.ok(Map.of("score", score));
    }
}