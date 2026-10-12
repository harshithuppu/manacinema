package com.movietheater.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for importing a TMDB movie into our local database.
 * Admin sends this from the Admin Movies page.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MovieImportRequest {

    /** The TMDB movie ID to fetch and import */
    @com.fasterxml.jackson.annotation.JsonAlias({"tmdb_id", "tmdbId"})
    @JsonProperty("tmdbId")
    private Long tmdbId;

    /** Local status to assign: NOW_SHOWING, COMING_SOON, ENDED */
    private String status;

    /** Override language label (e.g. "Telugu", "Hindi", "English") */
    private String language;

    /** Override director */
    private String director;

    /** Override cast */
    private String cast;

    /** Certification override (U, UA, A) */
    private String certification;

    // Getters and setters
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }
    public String getCast() { return cast; }
    public void setCast(String cast) { this.cast = cast; }
    public String getCertification() { return certification; }
    public void setCertification(String certification) { this.certification = certification; }
}
