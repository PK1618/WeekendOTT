package org.pk0918.weekendott.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.*;

@Entity
@Table(
        name = "movie_availability",
        indexes = {
                @Index(name = "idx_platform_release", columnList = "platform_id, ottReleaseDate")
        }
)

@Getter @Setter
public class MovieAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "platform_id", nullable = false)
    private Platform platform;

    @Column(nullable = false)
    private String language;

    private LocalDate ottReleaseDate;

}
