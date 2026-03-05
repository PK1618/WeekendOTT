package org.pk0918.weekendott.dto;

import java.util.List;
import java.util.UUID;

public record MovieDetailsDto(
        UUID id,
        String title,
        String description,
        String posterUrl,
        Integer releaseYear,
        List<String> genres,
        Double avgRating,
        Long ratingCount,
        List<MovieAvailabilityDto> availability
) {}
