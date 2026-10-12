package com.movietheater.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "screens")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "total_seats")
    private Integer totalSeats;

    @Enumerated(EnumType.STRING)
    @Column(name = "screen_type", length = 20)
    private ScreenType screenType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id")
    @JsonIgnoreProperties("screens")
    private Theater theater;

    @JsonIgnore
    @OneToMany(mappedBy = "screen", cascade = CascadeType.ALL)
    private List<Seat> seats = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "screen", cascade = CascadeType.ALL)
    private List<Show> shows = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Screen() {}

    public Screen(Long id, String name, Integer totalSeats, ScreenType screenType, Theater theater, List<Seat> seats, List<Show> shows, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.totalSeats = totalSeats;
        this.screenType = screenType;
        this.theater = theater;
        this.seats = seats != null ? seats : new ArrayList<>();
        this.shows = shows != null ? shows : new ArrayList<>();
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private Integer totalSeats;
        private ScreenType screenType;
        private Theater theater;
        private List<Seat> seats = new ArrayList<>();
        private List<Show> shows = new ArrayList<>();
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder totalSeats(Integer totalSeats) { this.totalSeats = totalSeats; return this; }
        public Builder screenType(ScreenType screenType) { this.screenType = screenType; return this; }
        public Builder theater(Theater theater) { this.theater = theater; return this; }
        public Builder seats(List<Seat> seats) { this.seats = seats; return this; }
        public Builder shows(List<Show> shows) { this.shows = shows; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Screen build() {
            return new Screen(id, name, totalSeats, screenType, theater, seats, shows, createdAt);
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ScreenType {
        STANDARD, IMAX, FOUR_DX, THREE_D
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
    public ScreenType getScreenType() { return screenType; }
    public void setScreenType(ScreenType screenType) { this.screenType = screenType; }
    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }
    public List<Seat> getSeats() { return seats; }
    public void setSeats(List<Seat> seats) { this.seats = seats; }
    public List<Show> getShows() { return shows; }
    public void setShows(List<Show> shows) { this.shows = shows; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
