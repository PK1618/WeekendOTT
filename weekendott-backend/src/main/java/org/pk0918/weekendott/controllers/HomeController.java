package org.pk0918.weekendott.controllers;

import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.dto.HomeResponseDto;
import org.pk0918.weekendott.services.MovieQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final MovieQueryService movieQueryService;

    @GetMapping
    public HomeResponseDto home() {
        return new HomeResponseDto(
                movieQueryService.recentReleases(12),
                movieQueryService.topRated(12)
        );
    }
}
