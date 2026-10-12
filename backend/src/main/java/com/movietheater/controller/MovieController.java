package com.movietheater.controller;

import com.movietheater.dto.MovieImportRequest;
import com.movietheater.dto.TmdbMovieDto;
import com.movietheater.model.Movie;
import com.movietheater.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/movies")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MovieController {

    @Autowired
    private MovieService movieService;

    // ── Public catalog endpoints ─────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<Movie>> getAllMovies(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy
    ) {
        return ResponseEntity.ok(movieService.getAllMovies(page, size, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    @GetMapping("/now-showing")
    public ResponseEntity<Page<Movie>> getNowShowingMovies(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String language
    ) {
        if (language != null && !language.isBlank()) {
            return ResponseEntity.ok(movieService.getMoviesByStatusAndLanguage(
                    Movie.MovieStatus.NOW_SHOWING, language, page, size));
        }
        return ResponseEntity.ok(movieService.getMoviesByStatus(Movie.MovieStatus.NOW_SHOWING, page, size));
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<Page<Movie>> getComingSoonMovies(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String language
    ) {
        if (language != null && !language.isBlank()) {
            return ResponseEntity.ok(movieService.getMoviesByStatusAndLanguage(
                    Movie.MovieStatus.COMING_SOON, language, page, size));
        }
        return ResponseEntity.ok(movieService.getMoviesByStatus(Movie.MovieStatus.COMING_SOON, page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Movie>> searchMovies(
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String genre,
        @RequestParam(required = false) String language,
        @RequestParam(required = false) Movie.MovieStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(movieService.searchMovies(title, genre, language, status, page, size));
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getAllGenres() {
        return ResponseEntity.ok(movieService.getAllGenres());
    }

    @GetMapping("/languages")
    public ResponseEntity<List<String>> getAllLanguages() {
        return ResponseEntity.ok(movieService.getAllLanguages());
    }

    // ── TMDB Proxy endpoints (Public & Admin) ────────────────────────────────

    /**
     * Public endpoint to fetch TMDB now-playing / trending blockbusters.
     */
    @GetMapping("/public/tmdb/now-playing")
    public ResponseEntity<List<TmdbMovieDto>> getPublicTmdbNowPlaying(
        @RequestParam(required = false) String language,
        @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(movieService.getTmdbNowPlaying(language, page));
    }

    /**
     * Public endpoint to search TMDB movies.
     */
    @GetMapping("/public/tmdb/search")
    public ResponseEntity<List<TmdbMovieDto>> getPublicTmdbSearch(
        @RequestParam String query,
        @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(movieService.searchTmdb(query, page));
    }

    /**
     * Search TMDB by query — API key never leaves the server.
     */
    @GetMapping("/admin/tmdb/search")
    public ResponseEntity<List<TmdbMovieDto>> searchTmdb(
        @RequestParam String query,
        @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(movieService.searchTmdb(query, page));
    }

    /**
     * Get TMDB now-playing (India region).
     */
    @GetMapping("/admin/tmdb/now-playing")
    public ResponseEntity<List<TmdbMovieDto>> getTmdbNowPlaying(
        @RequestParam(required = false) String language,
        @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(movieService.getTmdbNowPlaying(language, page));
    }

    /**
     * Get full TMDB movie details by TMDB id.
     */
    @GetMapping("/admin/tmdb/{tmdbId}")
    public ResponseEntity<TmdbMovieDto> getTmdbMovieDetails(@PathVariable Long tmdbId) {
        TmdbMovieDto dto = movieService.getTmdbMovieDetails(tmdbId);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    /**
     * Import a TMDB movie into local database with admin-specified metadata.
     * Idempotent: returns existing movie if already imported.
     */
    @PostMapping("/admin/tmdb/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> importFromTmdb(@RequestBody MovieImportRequest request) {
        return ResponseEntity.ok(movieService.importFromTmdb(request));
    }

    /**
     * Quick status update (Now Showing / Coming Soon / Ended).
     */
    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> updateStatus(
        @PathVariable Long id,
        @RequestParam Movie.MovieStatus status
    ) {
        return ResponseEntity.ok(movieService.updateMovieStatus(id, status));
    }

    // ── Admin CRUD ────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {
        return ResponseEntity.ok(movieService.createMovie(movie));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie movie) {
        return ResponseEntity.ok(movieService.updateMovie(id, movie));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(Map.of("message", "Movie deleted successfully"));
    }
}
