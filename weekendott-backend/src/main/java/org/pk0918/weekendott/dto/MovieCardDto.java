package org.pk0918.weekendott.dto;

import java.util.List;
import java.util.UUID;

public record MovieCardDto (
    UUID id,
    String title,
    String posterUrl,
    Integer releaseYear,
    Double avgRating,
    Long ratingCount,
    List<AvailabilityBadgeDto> availabilityBadges
) {}
