package com.movietheater.service;

import com.movietheater.dto.MovieImportRequest;
import com.movietheater.dto.TmdbMovieDto;
import com.movietheater.model.Movie;
import com.movietheater.repository.MovieRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private static final Logger log = LoggerFactory.getLogger(MovieService.class);

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TMDBService tmdbService;

    // ── Public catalog queries ────────────────────────────────────────────────

    public Page<Movie> getAllMovies(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return movieRepository.findAll(pageable);
    }

    public Page<Movie> getMoviesByStatus(Movie.MovieStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("releaseDate").descending());
        return movieRepository.findByStatus(status, pageable);
    }

    public Page<Movie> getMoviesByStatusAndLanguage(Movie.MovieStatus status, String language, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("releaseDate").descending());
        return movieRepository.findByStatusAndLanguageIgnoreCase(status, language, pageable);
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Movie not found with id: " + id));
    }

    public Page<Movie> searchMovies(String title, String genre, String language,
                                     Movie.MovieStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());
        return movieRepository.searchMovies(title, genre, language, status, pageable);
    }

    public List<String> getAllGenres() {
        return movieRepository.findAllGenres();
    }

    public List<String> getAllLanguages() {
        return movieRepository.findAllLanguages();
    }

    // ── TMDB Search (admin) ───────────────────────────────────────────────────

    /**
     * Proxy TMDB search to admin — key stays server-side.
     */
    public List<TmdbMovieDto> searchTmdb(String query, int page) {
        return tmdbService.searchMovies(query, page);
    }

    /**
     * Proxy TMDB now-playing list to admin.
     */
    public List<TmdbMovieDto> getTmdbNowPlaying(String language, int page) {
        return tmdbService.getNowPlaying(language, page);
    }

    /**
     * Get details of a single TMDB movie (before import).
     */
    public TmdbMovieDto getTmdbMovieDetails(Long tmdbId) {
        return tmdbService.getMovieDetails(tmdbId);
    }

    // ── TMDB Import ───────────────────────────────────────────────────────────

    /**
     * Import a movie from TMDB into our local MySQL database.
     * Idempotent — if tmdbId already exists, returns existing record.
     */
    @Transactional
    public Movie importFromTmdb(MovieImportRequest request) {
        Long tmdbId = request.getTmdbId();

        // Idempotency: return existing if already imported
        Optional<Movie> existing = movieRepository.findByTmdbId(tmdbId);
        if (existing.isPresent()) {
            log.info("Movie with tmdbId {} already exists in local DB, returning.", tmdbId);
            return existing.get();
        }

        // Fetch full TMDB details
        TmdbMovieDto tmdb = tmdbService.getMovieDetails(tmdbId);
        if (tmdb == null) {
            throw new RuntimeException("TMDB movie not found for id: " + tmdbId);
        }

        // Fetch trailer
        String trailerKey = tmdbService.getTrailerKey(tmdbId);
        String trailerUrl = trailerKey != null ? "https://www.youtube.com/watch?v=" + trailerKey : null;

        // Map genres
        String genre = "General";
        if (tmdb.getGenres() != null && !tmdb.getGenres().isEmpty()) {
            genre = tmdb.getGenres().stream()
                    .map(TmdbMovieDto.TmdbGenreDto::getName)
                    .collect(Collectors.joining(", "));
        }

        // Resolve language: use admin override if provided, else map from TMDB ISO code
        String language = (request.getLanguage() != null && !request.getLanguage().isBlank())
                ? request.getLanguage()
                : TMDBService.resolveLanguageLabel(tmdb.getOriginalLanguage());

        // Parse release date
        LocalDate releaseDate = null;
        if (tmdb.getReleaseDate() != null && !tmdb.getReleaseDate().isBlank()) {
            try {
                releaseDate = LocalDate.parse(tmdb.getReleaseDate());
            } catch (Exception ignored) {}
        }

        // Certification override
        Movie.Certification cert = Movie.Certification.UA;
        if (request.getCertification() != null) {
            try {
                cert = Movie.Certification.valueOf(request.getCertification().toUpperCase());
            } catch (Exception ignored) {}
        }

        // Status override
        Movie.MovieStatus status = Movie.MovieStatus.NOW_SHOWING;
        if (request.getStatus() != null) {
            try {
                status = Movie.MovieStatus.valueOf(request.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        Movie movie = Movie.builder()
                .title(tmdb.getTitle())
                .description(tmdb.getOverview())
                .genre(genre)
                .language(language)
                .originalLanguage(tmdb.getOriginalLanguage())
                .director(request.getDirector() != null ? request.getDirector() : "")
                .cast(request.getCast() != null ? request.getCast() : "")
                .releaseDate(releaseDate)
                .durationMinutes(tmdb.getRuntime() != null ? tmdb.getRuntime() : 0)
                .posterUrl(tmdb.getPosterUrl())
                .backdropUrl(tmdb.getBackdropUrl())
                .trailerUrl(trailerUrl)
                .rating(tmdb.getVoteAverage() != null ? tmdb.getVoteAverage() / 2 : null) // TMDB is /10, we use /5
                .certification(cert)
                .status(status)
                .tmdbId(tmdbId)
                .popularity(tmdb.getPopularity())
                .importedFromTmdb(true)
                .build();

        Movie saved = movieRepository.save(movie);
        log.info("Imported movie '{}' (tmdbId={}) as local id={}", saved.getTitle(), tmdbId, saved.getId());
        return saved;
    }

    // ── Admin CRUD ────────────────────────────────────────────────────────────

    private String normalizePosterUrl(String url) {
        if (url == null || url.isBlank()) return url;
        String trimmed = url.trim();
        if (trimmed.startsWith("/t/p/")) {
            return "https://image.tmdb.org" + trimmed;
        } else if (trimmed.startsWith("/") && (trimmed.endsWith(".jpg") || trimmed.endsWith(".jpeg") || trimmed.endsWith(".png") || trimmed.endsWith(".webp"))) {
            return "https://image.tmdb.org/t/p/w500" + trimmed;
        }
        return trimmed;
    }

    @Transactional
    public Movie createMovie(Movie movie) {
        if (movie.getPosterUrl() != null) {
            movie.setPosterUrl(normalizePosterUrl(movie.getPosterUrl()));
        }
        return movieRepository.save(movie);
    }

    @Transactional
    public Movie updateMovie(Long id, Movie updatedMovie) {
        Movie existing = getMovieById(id);
        existing.setTitle(updatedMovie.getTitle());
        existing.setDescription(updatedMovie.getDescription());
        existing.setGenre(updatedMovie.getGenre());
        existing.setLanguage(updatedMovie.getLanguage());
        existing.setDirector(updatedMovie.getDirector());
        existing.setCast(updatedMovie.getCast());
        existing.setReleaseDate(updatedMovie.getReleaseDate());
        existing.setDurationMinutes(updatedMovie.getDurationMinutes());
        existing.setPosterUrl(normalizePosterUrl(updatedMovie.getPosterUrl()));
        existing.setBackdropUrl(updatedMovie.getBackdropUrl());
        existing.setTrailerUrl(updatedMovie.getTrailerUrl());
        existing.setRating(updatedMovie.getRating());
        existing.setCertification(updatedMovie.getCertification());
        existing.setStatus(updatedMovie.getStatus());
        return movieRepository.save(existing);
    }

    @Transactional
    public Movie updateMovieStatus(Long id, Movie.MovieStatus status) {
        Movie existing = getMovieById(id);
        existing.setStatus(status);
        return movieRepository.save(existing);
    }

    @Transactional
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new EntityNotFoundException("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
    }
}
