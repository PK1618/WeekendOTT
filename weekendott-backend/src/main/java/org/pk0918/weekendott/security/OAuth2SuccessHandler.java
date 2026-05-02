package org.pk0918.weekendott.security;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.entities.User;
import org.pk0918.weekendott.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Comma-separated admin emails e.g. "a@gmail.com,b@gmail.com"
    // Using String + split instead of List<String> to avoid YAML binding issues
    @Value("${app.admin.emails:}")
    private String adminEmailsRaw;

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Google provides these attributes
        String googleId  = oAuth2User.getAttribute("sub");   // Google's unique user ID
        String email     = oAuth2User.getAttribute("email");
        String name      = oAuth2User.getAttribute("name");
        String picture   = oAuth2User.getAttribute("picture");

        // Find existing user or create new one (find-or-create pattern)
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setGoogleId(googleId);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setPictureUrl(picture);
                    // Assign ADMIN role if email is in the allowed admin list
                    boolean newIsAdmin = java.util.Arrays.stream(adminEmailsRaw.split(","))
                            .map(String::trim)
                            .anyMatch(e -> e.equalsIgnoreCase(email.trim()));
                    newUser.setRole(newIsAdmin ? "ADMIN" : "USER");
                    return newUser;
                });

        // Update profile info in case name/picture changed on Google
        user.setEmail(email);
        user.setName(name);
        user.setPictureUrl(picture);
        user.setLastLoginAt(Instant.now());

        // Re-check admin status on every login — trim + case-insensitive match
        boolean isAdmin = java.util.Arrays.stream(adminEmailsRaw.split(","))
                .map(String::trim)
                .anyMatch(e -> e.equalsIgnoreCase(email.trim()));
        log.info("OAuth2 login | email: {} | adminEmailsRaw: '{}' | isAdmin: {}", email, adminEmailsRaw, isAdmin);
        user.setRole(isAdmin ? "ADMIN" : "USER");

        userRepository.save(user);

        // Issue our own JWT
        String jwt = jwtUtil.generateToken(user);

//        Cookie cookie = new Cookie("wott_token", jwt);
//        cookie.setHttpOnly(true);
//        cookie.setSecure(true);
//        cookie.setPath("/");
//        cookie.setMaxAge(7*24*60*60);
//        response.addCookie(cookie);
//
//        String cookieHeader = response.getHeader("Set-Cookie");
//        if(cookieHeader != null){
//            response.setHeader("Set-Cookie", cookieHeader + "; SameSite=Lax");
//        }

        ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        // Redirect directly to frontend home — no token in URL
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/");
        log.info("Redirecting to frontendurl: {}", frontendUrl);
    }
}