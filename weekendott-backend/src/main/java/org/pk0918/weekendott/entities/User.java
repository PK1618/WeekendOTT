package org.pk0918.weekendott.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String googleId;

    @Column(nullable = false)
    private String email;

    private String name;

    private String pictureUrl;

    @Column(nullable = false)
    private String role = "USER";

    private Instant createdAt = Instant.now();

    private Instant lastLoginAt = Instant.now();
}
