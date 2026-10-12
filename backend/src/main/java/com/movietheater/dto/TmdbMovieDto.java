package com.movietheater.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * DTO mapping for TMDB /search/movie and /movie/{id} API responses.
 * Only exposes safe, non-key metadata to the frontend.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbMovieDto {

    private Long id;
    private String title;

    @com.fasterxml.jackson.annotation.JsonAlias({"original_title", "originalTitle"})
    private String originalTitle;

    private String overview;

    @com.fasterxml.jackson.annotation.JsonAlias({"poster_path", "posterPath"})
    private String posterPath;

    @com.fasterxml.jackson.annotation.JsonAlias({"backdrop_path", "backdropPath"})
    private String backdropPath;

    @com.fasterxml.jackson.annotation.JsonAlias({"release_date", "releaseDate"})
    private String releaseDate;

    @com.fasterxml.jackson.annotation.JsonAlias({"vote_average", "voteAverage"})
    private Double voteAverage;

    @com.fasterxml.jackson.annotation.JsonAlias({"vote_count", "voteCount"})
    private Integer voteCount;

    private Double popularity;

    @com.fasterxml.jackson.annotation.JsonAlias({"original_language", "originalLanguage"})
    private String originalLanguage;

    private Integer runtime;

    @com.fasterxml.jackson.annotation.JsonAlias({"genre_ids", "genreIds"})
    private List<Integer> genreIds;

    private List<TmdbGenreDto> genres;

    @com.fasterxml.jackson.annotation.JsonAlias({"already_imported", "alreadyImported"})
    private Boolean alreadyImported;

    // Computed full URLs (set by TMDBService before returning to frontend)
    private String posterUrl;
    private String backdropUrl;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getOriginalTitle() { return originalTitle; }
    public void setOriginalTitle(String originalTitle) { this.originalTitle = originalTitle; }
    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }
    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }
    public String getBackdropPath() { return backdropPath; }
    public void setBackdropPath(String backdropPath) { this.backdropPath = backdropPath; }
    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
    public Double getVoteAverage() { return voteAverage; }
    public void setVoteAverage(Double voteAverage) { this.voteAverage = voteAverage; }
    public Integer getVoteCount() { return voteCount; }
    public void setVoteCount(Integer voteCount) { this.voteCount = voteCount; }
    public Double getPopularity() { return popularity; }
    public void setPopularity(Double popularity) { this.popularity = popularity; }
    public String getOriginalLanguage() { return originalLanguage; }
    public void setOriginalLanguage(String originalLanguage) { this.originalLanguage = originalLanguage; }
    public Integer getRuntime() { return runtime; }
    public void setRuntime(Integer runtime) { this.runtime = runtime; }
    public List<Integer> getGenreIds() { return genreIds; }
    public void setGenreIds(List<Integer> genreIds) { this.genreIds = genreIds; }
    public List<TmdbGenreDto> getGenres() { return genres; }
    public void setGenres(List<TmdbGenreDto> genres) { this.genres = genres; }
    public Boolean getAlreadyImported() { return alreadyImported; }
    public void setAlreadyImported(Boolean alreadyImported) { this.alreadyImported = alreadyImported; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public String getBackdropUrl() { return backdropUrl; }
    public void setBackdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TmdbGenreDto {
        private Integer id;
        private String name;

        public TmdbGenreDto() {}

        public TmdbGenreDto(Integer id, String name) {
            this.id = id;
            this.name = name;
        }

        public TmdbGenreDto(Long id, String name) {
            this.id = id != null ? id.intValue() : null;
            this.name = name;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
