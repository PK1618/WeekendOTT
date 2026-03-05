package org.pk0918.weekendott.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentDto(
        UUID id,
        UUID userId,
        String userName,
        String userPicture,
        String text,
        boolean watched,
        boolean spoiler,
        Instant createdAt
) {
}
