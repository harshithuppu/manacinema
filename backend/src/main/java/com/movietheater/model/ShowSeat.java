package com.movietheater.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "show_seats")
public class ShowSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    @JsonIgnoreProperties({"showSeats", "bookings"})
    private Show show;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id", nullable = false)
    @JsonIgnoreProperties({"screen"})
    private Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private SeatStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;

    public ShowSeat() {}

    public ShowSeat(Long id, Show show, Seat seat, SeatStatus status, Booking booking) {
        this.id = id;
        this.show = show;
        this.seat = seat;
        this.status = status;
        this.booking = booking;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Show show;
        private Seat seat;
        private SeatStatus status;
        private Booking booking;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder show(Show show) { this.show = show; return this; }
        public Builder seat(Seat seat) { this.seat = seat; return this; }
        public Builder status(SeatStatus status) { this.status = status; return this; }
        public Builder booking(Booking booking) { this.booking = booking; return this; }

        public ShowSeat build() {
            return new ShowSeat(id, show, seat, status, booking);
        }
    }

    public enum SeatStatus {
        AVAILABLE, RESERVED, BOOKED, BLOCKED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Show getShow() { return show; }
    public void setShow(Show show) { this.show = show; }
    public Seat getSeat() { return seat; }
    public void setSeat(Seat seat) { this.seat = seat; }
    public SeatStatus getStatus() { return status; }
    public void setStatus(SeatStatus status) { this.status = status; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
}
