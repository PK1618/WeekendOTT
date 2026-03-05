package org.pk0918.weekendott.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.CommentDto;
import org.pk0918.weekendott.dto.CommentRequest;
import org.pk0918.weekendott.security.UserPrincipal;
import org.pk0918.weekendott.services.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/movies/{movieId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // GET — public, no auth needed
    @GetMapping
    public Page<CommentDto> list(
            @PathVariable UUID movieId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return commentService.listComments(movieId, page, size);
    }

    // POST — requires login, read principal from SecurityContext directly
    @PostMapping
    public ResponseEntity<CommentDto> add(
            @PathVariable UUID movieId,
            @Valid @RequestBody CommentRequest req
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            return ResponseEntity.status(401).build();
        }
        CommentDto comment = commentService.addComment(movieId, user.getId(), req);
        return ResponseEntity.status(201).body(comment);
    }
}