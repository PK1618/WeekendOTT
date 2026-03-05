package org.pk0918.weekendott.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.CommentDto;
import org.pk0918.weekendott.dto.CommentRequest;
import org.pk0918.weekendott.entities.Comment;
import org.pk0918.weekendott.entities.Movie;
import org.pk0918.weekendott.repositories.CommentRepository;
import org.pk0918.weekendott.repositories.MovieRepository;
import org.pk0918.weekendott.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepo;
    private final MovieRepository movieRepo;
    private final UserRepository userRepo;

    @Transactional
    public CommentDto addComment(UUID movieId, UUID userId, CommentRequest req) {
        Movie movie = movieRepo.findById(movieId).orElseThrow(() -> new RuntimeException("Movie not found"));

        Comment c = new Comment();
        c.setMovie(movie);
        c.setUserId(userId);
        c.setText(req.text());
        c.setWatched(req.watched());
        c.setSpoiler(req.spoiler());
        c.setCreatedAt(Instant.now());

        Comment saved = commentRepo.save(c);

        return toDto(saved);
    }

    public Page<CommentDto> listComments(UUID movieId, int page, int size){
        Page<Comment> result = commentRepo.findByMovieIdOrderByCreatedAtDesc(
                movieId,
                PageRequest.of(page, size)
        );

        return result.map(this::toDto);
    }

    public CommentDto toDto(Comment c) {
        String userName = c.getUserId().toString().substring(0, 8);
        String userPicture = null;

        var userOpt = userRepo.findById(c.getUserId());
        if (userOpt.isPresent()) {
            var u = userOpt.get();
            userName = u.getName() != null ? u.getName() : u.getEmail();
            userPicture = u.getPictureUrl();
        }

        return new CommentDto(
                c.getId(),
                c.getUserId(),
                userName,
                userPicture,
                c.getText(),
                c.isWatched(),
                c.isSpoiler(),
                c.getCreatedAt()
        );
    }
}