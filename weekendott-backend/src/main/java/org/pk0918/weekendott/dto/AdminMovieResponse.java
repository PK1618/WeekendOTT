package org.pk0918.weekendott.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AdminMovieResponse(
        UUID id,
        String title,
        String description,
        String posterUrl,
        Integer releaseYear,
        List<String> genres,
        List<AvailabilityEntry> availability
) {
    public record AvailabilityEntry(
            UUID id,
            String platform,
            String language,
            LocalDate ottReleaseDate
    ) {}
}
