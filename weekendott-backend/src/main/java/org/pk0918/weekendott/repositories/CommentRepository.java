package org.pk0918.weekendott.repositories;

import org.pk0918.weekendott.entities.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findByMovieIdOrderByCreatedAtDesc(
            UUID movieId,
            Pageable pageable
    );
}
