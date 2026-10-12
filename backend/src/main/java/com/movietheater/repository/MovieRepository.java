package com.movietheater.repository;

import com.movietheater.model.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    Page<Movie> findByStatus(Movie.MovieStatus status, Pageable pageable);

    Optional<Movie> findByTmdbId(Long tmdbId);

    /** Collect all existing TMDB IDs to mark already-imported entries */
    @Query("SELECT m.tmdbId FROM Movie m WHERE m.tmdbId IS NOT NULL")
    List<Long> findAllTmdbIds();

    @Query("SELECT m FROM Movie m WHERE " +
        "(:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
        "(:genre IS NULL OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :genre, '%'))) AND " +
        "(:language IS NULL OR LOWER(m.language) = LOWER(:language)) AND " +
        "(:status IS NULL OR m.status = :status)")
    Page<Movie> searchMovies(
        @Param("title") String title,
        @Param("genre") String genre,
        @Param("language") String language,
        @Param("status") Movie.MovieStatus status,
        Pageable pageable
    );

    Page<Movie> findByStatusAndLanguageIgnoreCase(Movie.MovieStatus status, String language, Pageable pageable);

    List<Movie> findByGenreIgnoreCase(String genre);

    @Query("SELECT DISTINCT m.genre FROM Movie m WHERE m.genre IS NOT NULL ORDER BY m.genre")
    List<String> findAllGenres();

    @Query("SELECT DISTINCT m.language FROM Movie m WHERE m.language IS NOT NULL ORDER BY m.language")
    List<String> findAllLanguages();

    boolean existsByTmdbId(Long tmdbId);
}
