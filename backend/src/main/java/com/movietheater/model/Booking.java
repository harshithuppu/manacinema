package com.movietheater.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_number", unique = true, nullable = false)
    private String bookingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "roles", "bookings", "authorities"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "show_id", nullable = false)
    @JsonIgnoreProperties({"bookings", "showSeats"})
    private Show show;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "convenience_fee")
    private Double convenienceFee;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "final_amount", nullable = false)
    private Double finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", length = 20)
    private BookingStatus bookingStatus;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_transaction_id")
    private String paymentTransactionId;

    @Column(name = "booking_time")
    private LocalDateTime bookingTime;

    @Column(name = "cancellation_time")
    private LocalDateTime cancellationTime;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"booking", "show"})
    private List<ShowSeat> bookedSeats = new ArrayList<>();

    public Booking() {}

    public Booking(Long id, String bookingNumber, User user, Show show, Double totalAmount, Double convenienceFee, Double discountAmount, Double finalAmount, PaymentStatus paymentStatus, BookingStatus bookingStatus, String paymentMethod, String paymentTransactionId, LocalDateTime bookingTime, LocalDateTime cancellationTime, List<ShowSeat> bookedSeats) {
        this.id = id;
        this.bookingNumber = bookingNumber;
        this.user = user;
        this.show = show;
        this.totalAmount = totalAmount;
        this.convenienceFee = convenienceFee;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.paymentStatus = paymentStatus;
        this.bookingStatus = bookingStatus;
        this.paymentMethod = paymentMethod;
        this.paymentTransactionId = paymentTransactionId;
        this.bookingTime = bookingTime;
        this.cancellationTime = cancellationTime;
        this.bookedSeats = bookedSeats != null ? bookedSeats : new ArrayList<>();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String bookingNumber;
        private User user;
        private Show show;
        private Double totalAmount;
        private Double convenienceFee;
        private Double discountAmount;
        private Double finalAmount;
        private PaymentStatus paymentStatus;
        private BookingStatus bookingStatus;
        private String paymentMethod;
        private String paymentTransactionId;
        private LocalDateTime bookingTime;
        private LocalDateTime cancellationTime;
        private List<ShowSeat> bookedSeats = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder bookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder show(Show show) { this.show = show; return this; }
        public Builder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder convenienceFee(Double convenienceFee) { this.convenienceFee = convenienceFee; return this; }
        public Builder discountAmount(Double discountAmount) { this.discountAmount = discountAmount; return this; }
        public Builder finalAmount(Double finalAmount) { this.finalAmount = finalAmount; return this; }
        public Builder paymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public Builder bookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; return this; }
        public Builder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder paymentTransactionId(String paymentTransactionId) { this.paymentTransactionId = paymentTransactionId; return this; }
        public Builder bookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; return this; }
        public Builder cancellationTime(LocalDateTime cancellationTime) { this.cancellationTime = cancellationTime; return this; }
        public Builder bookedSeats(List<ShowSeat> bookedSeats) { this.bookedSeats = bookedSeats; return this; }

        public Booking build() {
            return new Booking(id, bookingNumber, user, show, totalAmount, convenienceFee, discountAmount, finalAmount, paymentStatus, bookingStatus, paymentMethod, paymentTransactionId, bookingTime, cancellationTime, bookedSeats);
        }
    }

    @PrePersist
    protected void onCreate() {
        bookingTime = LocalDateTime.now();
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }

    public enum BookingStatus {
        CONFIRMED, CANCELLED, PENDING, EXPIRED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Show getShow() { return show; }
    public void setShow(Show show) { this.show = show; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public Double getConvenienceFee() { return convenienceFee; }
    public void setConvenienceFee(Double convenienceFee) { this.convenienceFee = convenienceFee; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentTransactionId() { return paymentTransactionId; }
    public void setPaymentTransactionId(String paymentTransactionId) { this.paymentTransactionId = paymentTransactionId; }
    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }
    public LocalDateTime getCancellationTime() { return cancellationTime; }
    public void setCancellationTime(LocalDateTime cancellationTime) { this.cancellationTime = cancellationTime; }
    public List<ShowSeat> getBookedSeats() { return bookedSeats; }
    public void setBookedSeats(List<ShowSeat> bookedSeats) { this.bookedSeats = bookedSeats; }
}
