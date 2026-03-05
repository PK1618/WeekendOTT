package org.pk0918.weekendott.controllers;

import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    // GET /auth/me — frontend calls this on load to check if token is still valid
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        // Read directly from SecurityContext — more reliable than @AuthenticationPrincipal
        // when using a custom principal class
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        return ResponseEntity.ok(Map.of(
                "id",      user.getId().toString(),
                "email",   user.getEmail(),
                "name",    user.getName(),
                "picture", user.getPicture() != null ? user.getPicture() : "",
                "role",    user.getRole(),
                "isAdmin", user.isAdmin()
        ));
    }
}