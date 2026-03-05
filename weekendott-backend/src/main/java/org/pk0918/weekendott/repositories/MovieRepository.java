package org.pk0918.weekendott.repositories;

import org.pk0918.weekendott.entities.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, UUID> {
    List<Movie> findByTitleContainingIgnoreCase(String title);

    @Query("""
            select distinct m from Movie m join m.genres g where g.name = :genre
            """
    )
    List<Movie> findByGenre(@Param("genre") String genre);


}
