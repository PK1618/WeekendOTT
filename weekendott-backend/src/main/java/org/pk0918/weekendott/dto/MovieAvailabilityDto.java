package org.pk0918.weekendott.dto;

import java.time.LocalDate;
import java.util.UUID;

public record MovieAvailabilityDto(
        UUID id,
        String platform,
        String language,
        LocalDate ottReleaseDate
) {}
