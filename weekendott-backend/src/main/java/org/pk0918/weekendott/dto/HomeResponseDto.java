package org.pk0918.weekendott.dto;

import java.util.List;

public record HomeResponseDto(
        List<MovieCardDto> recentReleases,
        List<MovieCardDto> topRated
) {}
