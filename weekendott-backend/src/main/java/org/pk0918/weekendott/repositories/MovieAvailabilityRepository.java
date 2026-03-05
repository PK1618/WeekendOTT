package org.pk0918.weekendott.repositories;

import org.pk0918.weekendott.entities.MovieAvailability;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MovieAvailabilityRepository extends JpaRepository<MovieAvailability, UUID> {

    @Query(""" 
            select ma from MovieAvailability ma order by ma.ottReleaseDate desc 
            """)
    Page<MovieAvailability> findRecentReleases(Pageable pageable);

    @Query("""
            select ma from MovieAvailability ma 
            where (:platform is null or lower(ma.platform.name) = lower(:platform))
            and (:language is null or lower(ma.language) = lower(:language))
""")
    Page<MovieAvailability> filterAvailability(
            @Param("platform") String platform,
            @Param("language") String language,
            Pageable pageable
    );
    List<MovieAvailability> findByMovieId(UUID moveId);

}
