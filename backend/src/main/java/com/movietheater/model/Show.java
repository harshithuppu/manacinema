package com.movietheater.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shows")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "movie_id", nullable = false)
    @JsonIgnoreProperties("shows")
    private Movie movie;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "screen_id", nullable = false)
    @JsonIgnoreProperties({"shows", "seats"})
    private Screen screen;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "price_regular")
    private Double priceRegular;

    @Column(name = "price_premium")
    private Double pricePremium;

    @Column(name = "price_vip")
    private Double priceVip;

    @Column(name = "price_recliner")
    private Double priceRecliner;

    @Enumerated(EnumType.STRING)
    private ShowStatus status;

    @JsonIgnore
    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL)
    private List<ShowSeat> showSeats = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Show() {}

    public Show(Long id, Movie movie, Screen screen, LocalDateTime startTime, LocalDateTime endTime, Double priceRegular, Double pricePremium, Double priceVip, Double priceRecliner, ShowStatus status, List<ShowSeat> showSeats, List<Booking> bookings, LocalDateTime createdAt) {
        this.id = id;
        this.movie = movie;
        this.screen = screen;
        this.startTime = startTime;
        this.endTime = endTime;
        this.priceRegular = priceRegular;
        this.pricePremium = pricePremium;
        this.priceVip = priceVip;
        this.priceRecliner = priceRecliner;
        this.status = status;
        this.showSeats = showSeats != null ? showSeats : new ArrayList<>();
        this.bookings = bookings != null ? bookings : new ArrayList<>();
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Movie movie;
        private Screen screen;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Double priceRegular;
        private Double pricePremium;
        private Double priceVip;
        private Double priceRecliner;
        private ShowStatus status;
        private List<ShowSeat> showSeats = new ArrayList<>();
        private List<Booking> bookings = new ArrayList<>();
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder movie(Movie movie) { this.movie = movie; return this; }
        public Builder screen(Screen screen) { this.screen = screen; return this; }
        public Builder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public Builder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public Builder priceRegular(Double priceRegular) { this.priceRegular = priceRegular; return this; }
        public Builder pricePremium(Double pricePremium) { this.pricePremium = pricePremium; return this; }
        public Builder priceVip(Double priceVip) { this.priceVip = priceVip; return this; }
        public Builder priceRecliner(Double priceRecliner) { this.priceRecliner = priceRecliner; return this; }
        public Builder status(ShowStatus status) { this.status = status; return this; }
        public Builder showSeats(List<ShowSeat> showSeats) { this.showSeats = showSeats; return this; }
        public Builder bookings(List<Booking> bookings) { this.bookings = bookings; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Show build() {
            return new Show(id, movie, screen, startTime, endTime, priceRegular, pricePremium, priceVip, priceRecliner, status, showSeats, bookings, createdAt);
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ShowStatus {
        SCHEDULED, ONGOING, COMPLETED, CANCELLED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public Screen getScreen() { return screen; }
    public void setScreen(Screen screen) { this.screen = screen; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Double getPriceRegular() { return priceRegular; }
    public void setPriceRegular(Double priceRegular) { this.priceRegular = priceRegular; }
    public Double getPricePremium() { return pricePremium; }
    public void setPricePremium(Double pricePremium) { this.pricePremium = pricePremium; }
    public Double getPriceVip() { return priceVip; }
    public void setPriceVip(Double priceVip) { this.priceVip = priceVip; }
    public Double getPriceRecliner() { return priceRecliner; }
    public void setPriceRecliner(Double priceRecliner) { this.priceRecliner = priceRecliner; }
    public ShowStatus getStatus() { return status; }
    public void setStatus(ShowStatus status) { this.status = status; }
    public List<ShowSeat> getShowSeats() { return showSeats; }
    public void setShowSeats(List<ShowSeat> showSeats) { this.showSeats = showSeats; }
    public List<Booking> getBookings() { return bookings; }
    public void setBookings(List<Booking> bookings) { this.bookings = bookings; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
