package org.pk0918.weekendott.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record AdminMovieRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255)
        String title,

        @Size(max = 2000)
        String description,

        Integer releaseYear,

        List<String> genres,

        @Valid
        List<AvailabilityEntry> availability
) {

    public record AvailabilityEntry (
            @NotBlank(message = "Platform name is required")
            String platform,

            @NotBlank(message = "Language is required")
            String language,

            @NotNull(message = "OTT release date is required")
            LocalDate ottReleaseDate
    ) {}
}
