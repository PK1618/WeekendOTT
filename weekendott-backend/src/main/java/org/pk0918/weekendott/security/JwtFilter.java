package org.pk0918.weekendott.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    // Skip JWT processing for OAuth2 and login paths — Spring Security handles these
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/oauth2/") || path.startsWith("/login/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        log.debug("JwtFilter | {} {} | Authorization header: {}",
                request.getMethod(), request.getRequestURI(),
                header != null ? "present" : "MISSING");

        // No token → continue as anonymous (public endpoints still work)
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        Claims claims = jwtUtil.validateAndParse(token);
        log.info("JwtFilter | claims parsed: {}", claims != null ? "OK email=" + claims.get("email") : "NULL/INVALID");

        if (claims != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UUID userId = jwtUtil.getUserId(claims);
            String email = jwtUtil.getEmail(claims);
            String name  = claims.get("name", String.class);
            String picture = claims.get("picture", String.class);
            String role  = jwtUtil.getRole(claims);

            UserPrincipal principal = new UserPrincipal(userId, email, name, picture, role);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
            log.info("JwtFilter | SecurityContext set for user: {} role: {}", email, role);
        }

        chain.doFilter(request, response);
    }
}