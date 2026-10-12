package com.movietheater.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "row_name", length = 5, nullable = false)
    private String rowName;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", length = 20)
    private SeatType seatType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id")
    @JsonIgnoreProperties({"seats", "shows", "theater"})
    private Screen screen;

    public Seat() {}

    public Seat(Long id, String rowName, Integer seatNumber, SeatType seatType, Screen screen) {
        this.id = id;
        this.rowName = rowName;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.screen = screen;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String rowName;
        private Integer seatNumber;
        private SeatType seatType;
        private Screen screen;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder rowName(String rowName) { this.rowName = rowName; return this; }
        public Builder seatNumber(Integer seatNumber) { this.seatNumber = seatNumber; return this; }
        public Builder seatType(SeatType seatType) { this.seatType = seatType; return this; }
        public Builder screen(Screen screen) { this.screen = screen; return this; }

        public Seat build() {
            return new Seat(id, rowName, seatNumber, seatType, screen);
        }
    }

    public enum SeatType {
        REGULAR, PREMIUM, VIP, RECLINER
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRowName() { return rowName; }
    public void setRowName(String rowName) { this.rowName = rowName; }
    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }
    public SeatType getSeatType() { return seatType; }
    public void setSeatType(SeatType seatType) { this.seatType = seatType; }
    public Screen getScreen() { return screen; }
    public void setScreen(Screen screen) { this.screen = screen; }
}
