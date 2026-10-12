package com.movietheater.controller;

import com.movietheater.model.Booking;
import com.movietheater.model.User;
import com.movietheater.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<Booking> createBooking(
        @AuthenticationPrincipal User user,
        @RequestBody BookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.createBooking(
            user.getId(), request.getShowId(), request.getSeatIds(), request.getPaymentMethod()
        ));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Booking>> getMyBookings(
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId(), page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/number/{bookingNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Booking> getBookingByNumber(@PathVariable String bookingNumber) {
        return ResponseEntity.ok(bookingService.getBookingByNumber(bookingNumber));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Booking> cancelBooking(
        @PathVariable Long id,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getId()));
    }

    // Inner DTO class for booking request
    public static class BookingRequest {
        private Long showId;
        private List<Long> seatIds;
        private String paymentMethod;

        public BookingRequest() {}
        public BookingRequest(Long showId, List<Long> seatIds, String paymentMethod) {
            this.showId = showId;
            this.seatIds = seatIds;
            this.paymentMethod = paymentMethod;
        }

        public Long getShowId() { return showId; }
        public void setShowId(Long showId) { this.showId = showId; }
        public List<Long> getSeatIds() { return seatIds; }
        public void setSeatIds(List<Long> seatIds) { this.seatIds = seatIds; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }
}
