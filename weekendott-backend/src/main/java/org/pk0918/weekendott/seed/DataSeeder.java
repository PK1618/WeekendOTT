package org.pk0918.weekendott.seed;

import lombok.RequiredArgsConstructor;
import org.pk0918.weekendott.entities.*;
import org.pk0918.weekendott.repositories.MovieRepository;
import org.pk0918.weekendott.repositories.PlatformRepository;
import org.pk0918.weekendott.repositories.GenreRepository;
import org.pk0918.weekendott.repositories.MovieAvailabilityRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final MovieRepository movieRepo;
    private final PlatformRepository platformRepo;
    private final GenreRepository genreRepo;
    private final MovieAvailabilityRepository availabilityRepo;

//    @Value("${app.seed.force:false}")
//    private boolean force;

    @Override
    public void run(String... args) {
        if (movieRepo.count() > 0) {
            System.out.println("Seeder skipped (movies already exist).");
            System.out.println("New DataSeeder");
            return;
        }

        Platform netflix = new Platform();
        netflix.setName("Netflix");
        netflix = platformRepo.save(netflix);

        Platform prime = new Platform();
        prime.setName("Prime Video");
        prime = platformRepo.save(prime);


        Genre action = new Genre();
        action.setName("Action");
        action = genreRepo.save(action);

        Genre thriller = new Genre();
        thriller.setName("Thriller");
        thriller = genreRepo.save(thriller);

        Genre comedy = new Genre();
        comedy.setName("Comedy");
        comedy = genreRepo.save(comedy);

        Movie m1 = new Movie();
        m1.setTitle("Weekend Test Movie 1");
        m1.setDescription("Seeded movie for API testing");
        m1.setReleaseYear(2025);
        m1.setGenres(Set.of(action, thriller));
        m1 = movieRepo.save(m1);

        Movie m2 = new Movie();
        m2.setTitle("Weekend Test Movie 2");
        m2.setDescription("Second seeded movie");
        m2.setReleaseYear(2024);
        m2.setGenres(Set.of(comedy));
        m2 = movieRepo.save(m2);

        Movie m3 = new Movie();
        m3.setTitle("Weekend Test Movie 3");
        m3.setDescription("Third seeded movie");
        m3.setReleaseYear(2023);
        m3.setGenres(Set.of(comedy));
        m3 = movieRepo.save(m3);

        MovieAvailability a1 = new MovieAvailability();
        a1.setMovie(m1);
        a1.setPlatform(netflix);
        a1.setLanguage("English");
        a1.setOttReleaseDate(LocalDate.now().minusDays(3));
        availabilityRepo.save(a1);

        MovieAvailability a2 = new MovieAvailability();
        a2.setMovie(m1);
        a2.setPlatform(prime);
        a2.setLanguage("Hindi");
        a2.setOttReleaseDate(LocalDate.now().minusDays(1));
        availabilityRepo.save(a2);

        MovieAvailability a3 = new MovieAvailability();
        a3.setMovie(m2);
        a3.setPlatform(netflix);
        a3.setLanguage("English");
        a3.setOttReleaseDate(LocalDate.now().minusDays(7));
        availabilityRepo.save(a3);

        MovieAvailability a4 = new MovieAvailability();
        a4.setMovie(m3);
        a4.setPlatform(netflix);
        a4.setLanguage("Telugu");
        a4.setOttReleaseDate(LocalDate.now().minusDays(7));
        availabilityRepo.save(a4);

        System.out.println("Seeded Movies:");
        System.out.println("Movie 1 ID: " + m1.getId());
        System.out.println("Movie 2 ID: " + m2.getId());
        System.out.println("Movie 3 ID: " + m3.getId());
    }
}
