package org.pk0918.weekendott.dto;

import jakarta.validation.constraints.NotNull;

public record RatingResponseDto(
        Double avgRating,
        Long ratingCount
) {}
