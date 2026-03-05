package org.pk0918.weekendott.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank @Size(max = 1000) String text,
        boolean watched,
        boolean spoiler
) {
}
