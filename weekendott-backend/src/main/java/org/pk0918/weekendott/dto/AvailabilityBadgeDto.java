package org.pk0918.weekendott.dto;

import java.time.LocalDate;

public record AvailabilityBadgeDto(
        String platform,
        String language,
        LocalDate ottReleaseDate
) {}
