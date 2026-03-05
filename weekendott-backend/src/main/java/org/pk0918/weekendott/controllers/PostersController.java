package org.pk0918.weekendott.controllers;

import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.entities.Movie;
import org.pk0918.weekendott.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movies")
public class PostersController {

    private static final long MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private final MovieRepository movieRepository;
    private final S3Client s3Client;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @PostMapping(value = "/{movieId}/poster", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPoster(
            @PathVariable UUID movieId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Poster file is required."));

        if (file.getSize() > MAX_FILE_BYTES)
            return ResponseEntity.badRequest().body(Map.of("error", "File too large. Max 5MB."));

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType))
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file type. Allowed: jpeg, png, webp."));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + movieId));

        String ext = extensionFromContentType(contentType);

        // Fixed key per movie — organized in its own folder, always overwrites on update
        // e.g. posters/7080ad53-8bd5-4c52-b4a7/poster.jpg
        String newKey = "posters/" + movieId + "/poster" + ext;

        // If the movie already has a poster with a DIFFERENT extension, delete the old one
        // (same extension = S3 overwrites automatically, no delete needed)
        if (movie.getPosterUrl() != null) {
            String oldKey = extractKeyFromUrl(movie.getPosterUrl());
            if (oldKey != null && !oldKey.equals(newKey)) {
                try {
                    s3Client.deleteObject(DeleteObjectRequest.builder()
                            .bucket(bucket)
                            .key(oldKey)
                            .build());
                } catch (Exception ignored) {
                    // Don't fail the upload if delete fails
                }
            }
        }

        // Upload new poster — overwrites if key already exists
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(newKey)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        String publicUrl = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + newKey;

        movie.setPosterUrl(publicUrl);
        movieRepository.save(movie);

        return ResponseEntity.ok(Map.of(
                "movieId", movieId.toString(),
                "posterUrl", publicUrl,
                "key", newKey
        ));
    }

    @GetMapping("/{movieId}/poster")
    public ResponseEntity<?> getPosterUrl(@PathVariable UUID movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + movieId));

        if (movie.getPosterUrl() == null)
            return ResponseEntity.status(404).body(Map.of("error", "No poster for movie " + movieId));

        return ResponseEntity.ok(Map.of(
                "movieId", movieId.toString(),
                "posterUrl", movie.getPosterUrl()
        ));
    }

    // Extract S3 key from a full URL
    // e.g. https://bucket.s3.region.amazonaws.com/posters/abc/poster.jpg → posters/abc/poster.jpg
    private String extractKeyFromUrl(String url) {
        try {
            String prefix = "amazonaws.com/";
            int idx = url.indexOf(prefix);
            return idx >= 0 ? url.substring(idx + prefix.length()) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String extensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png"               -> ".png";
            case "image/webp"              -> ".webp";
            default                        -> ".jpg";
        };
    }
}