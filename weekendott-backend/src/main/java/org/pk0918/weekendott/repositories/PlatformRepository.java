package org.pk0918.weekendott.repositories;


import org.pk0918.weekendott.entities.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformRepository extends JpaRepository<Platform, UUID> {
    Optional<Platform> findByNameIgnoreCase(String name);
}
