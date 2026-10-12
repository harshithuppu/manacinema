package com.movietheater.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "movies")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String genre;

    @Column(length = 100)
    private String language;

    @Column(length = 50)
    private String director;

    @Column(length = 200)
    private String cast;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "poster_url", length = 1000)
    private String posterUrl;

    @Column(name = "backdrop_url", length = 1000)
    private String backdropUrl;

    @Column(name = "trailer_url", length = 1000)
    private String trailerUrl;

    @Column
    private Double rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "certification", length = 10)
    private Certification certification;

    @Enumerated(EnumType.STRING)
    private MovieStatus status;

    /** TMDB movie ID — used for deduplication when importing */
    @Column(name = "tmdb_id", unique = true)
    private Long tmdbId;

    /** Original language ISO code from TMDB (e.g. "te", "hi", "en", "ta") */
    @Column(name = "original_language", length = 10)
    private String originalLanguage;

    @Column(name = "popularity")
    private Double popularity;

    @Column(name = "imported_from_tmdb")
    private Boolean importedFromTmdb = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<Show> shows = new ArrayList<>();

    public Movie() {}

    public Movie(Long id, String title, String description, String genre, String language, String director, String cast, LocalDate releaseDate, Integer durationMinutes, String posterUrl, String backdropUrl, String trailerUrl, Double rating, Certification certification, MovieStatus status, Long tmdbId, String originalLanguage, Double popularity, Boolean importedFromTmdb, LocalDateTime createdAt, LocalDateTime updatedAt, List<Show> shows) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.genre = genre;
        this.language = language;
        this.director = director;
        this.cast = cast;
        this.releaseDate = releaseDate;
        this.durationMinutes = durationMinutes;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.trailerUrl = trailerUrl;
        this.rating = rating;
        this.certification = certification;
        this.status = status;
        this.tmdbId = tmdbId;
        this.originalLanguage = originalLanguage;
        this.popularity = popularity;
        this.importedFromTmdb = importedFromTmdb != null ? importedFromTmdb : false;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.shows = shows != null ? shows : new ArrayList<>();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private String genre;
        private String language;
        private String director;
        private String cast;
        private LocalDate releaseDate;
        private Integer durationMinutes;
        private String posterUrl;
        private String backdropUrl;
        private String trailerUrl;
        private Double rating;
        private Certification certification;
        private MovieStatus status;
        private Long tmdbId;
        private String originalLanguage;
        private Double popularity;
        private Boolean importedFromTmdb = false;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<Show> shows = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder genre(String genre) { this.genre = genre; return this; }
        public Builder language(String language) { this.language = language; return this; }
        public Builder director(String director) { this.director = director; return this; }
        public Builder cast(String cast) { this.cast = cast; return this; }
        public Builder releaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; return this; }
        public Builder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public Builder posterUrl(String posterUrl) { this.posterUrl = posterUrl; return this; }
        public Builder backdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; return this; }
        public Builder trailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder certification(Certification certification) { this.certification = certification; return this; }
        public Builder status(MovieStatus status) { this.status = status; return this; }
        public Builder tmdbId(Long tmdbId) { this.tmdbId = tmdbId; return this; }
        public Builder originalLanguage(String originalLanguage) { this.originalLanguage = originalLanguage; return this; }
        public Builder popularity(Double popularity) { this.popularity = popularity; return this; }
        public Builder importedFromTmdb(Boolean importedFromTmdb) { this.importedFromTmdb = importedFromTmdb; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder shows(List<Show> shows) { this.shows = shows; return this; }

        public Movie build() {
            return new Movie(id, title, description, genre, language, director, cast, releaseDate, durationMinutes, posterUrl, backdropUrl, trailerUrl, rating, certification, status, tmdbId, originalLanguage, popularity, importedFromTmdb, createdAt, updatedAt, shows);
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Certification { U, UA, A, S }
    public enum MovieStatus { COMING_SOON, NOW_SHOWING, ENDED }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }
    public String getCast() { return cast; }
    public void setCast(String cast) { this.cast = cast; }
    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public String getBackdropUrl() { return backdropUrl; }
    public void setBackdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; }
    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Certification getCertification() { return certification; }
    public void setCertification(Certification certification) { this.certification = certification; }
    public MovieStatus getStatus() { return status; }
    public void setStatus(MovieStatus status) { this.status = status; }
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public String getOriginalLanguage() { return originalLanguage; }
    public void setOriginalLanguage(String originalLanguage) { this.originalLanguage = originalLanguage; }
    public Double getPopularity() { return popularity; }
    public void setPopularity(Double popularity) { this.popularity = popularity; }
    public Boolean getImportedFromTmdb() { return importedFromTmdb; }
    public void setImportedFromTmdb(Boolean importedFromTmdb) { this.importedFromTmdb = importedFromTmdb; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<Show> getShows() { return shows; }
    public void setShows(List<Show> shows) { this.shows = shows; }
}
