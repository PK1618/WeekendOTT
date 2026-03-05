package org.pk0918.weekendott.repositories;

import org.pk0918.weekendott.entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, UUID> {

    Optional<Rating> findByUserIdAndMovieId(UUID userId, UUID movieId);

    @Query("""
            select avg(r.score)
            from Rating r where r.movie.id = :movieId
""")
    Double getAverageRating(@Param("movieId") UUID movieId);

    long countByMovieId(UUID movieId);
}
