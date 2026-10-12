package com.movietheater.service;

import com.movietheater.model.*;
import com.movietheater.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking createBooking(Long userId, Long showId, List<Long> seatIds, String paymentMethod) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Show show = showRepository.findById(showId)
            .orElseThrow(() -> new EntityNotFoundException("Show not found"));

        // Verify seats availability
        List<ShowSeat> showSeats = showSeatRepository.findByShow_Id(showId);
        List<ShowSeat> selectedSeats = showSeats.stream()
            .filter(ss -> seatIds.contains(ss.getSeat().getId()))
            .toList();

        for (ShowSeat ss : selectedSeats) {
            if (ss.getStatus() != ShowSeat.SeatStatus.AVAILABLE) {
                throw new IllegalStateException("Seat " + ss.getSeat().getRowName() +
                    ss.getSeat().getSeatNumber() + " is not available");
            }
        }

        // Calculate pricing
        double totalAmount = selectedSeats.stream()
            .mapToDouble(ss -> getSeatPrice(ss.getSeat().getSeatType(), show))
            .sum();
        double convenienceFee = totalAmount * 0.02;
        double finalAmount = totalAmount + convenienceFee;

        // Create booking
        Booking booking = Booking.builder()
            .bookingNumber(generateBookingNumber())
            .user(user)
            .show(show)
            .totalAmount(totalAmount)
            .convenienceFee(convenienceFee)
            .discountAmount(0.0)
            .finalAmount(finalAmount)
            .paymentStatus(Booking.PaymentStatus.COMPLETED)
            .bookingStatus(Booking.BookingStatus.CONFIRMED)
            .paymentMethod(paymentMethod)
            .paymentTransactionId("TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
            .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Mark seats as booked
        for (ShowSeat ss : selectedSeats) {
            ss.setStatus(ShowSeat.SeatStatus.BOOKED);
            ss.setBooking(savedBooking);
            showSeatRepository.save(ss);
        }

        // Send confirmation email (async)
        emailService.sendBookingConfirmation(savedBooking);

        return savedBooking;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized to cancel this booking");
        }

        if (booking.getBookingStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        // Check cancellation window (2+ hours before show)
        if (booking.getShow().getStartTime().isBefore(LocalDateTime.now().plusHours(2))) {
            throw new IllegalStateException("Cannot cancel booking within 2 hours of showtime");
        }

        booking.setBookingStatus(Booking.BookingStatus.CANCELLED);
        booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        booking.setCancellationTime(LocalDateTime.now());

        // Free up seats
        List<ShowSeat> bookedSeats = showSeatRepository.findByShow_IdAndStatus(
            booking.getShow().getId(), ShowSeat.SeatStatus.BOOKED);
        bookedSeats.stream()
            .filter(ss -> ss.getBooking() != null && ss.getBooking().getId().equals(bookingId))
            .forEach(ss -> {
                ss.setStatus(ShowSeat.SeatStatus.AVAILABLE);
                ss.setBooking(null);
                showSeatRepository.save(ss);
            });

        Booking cancelledBooking = bookingRepository.save(booking);
        emailService.sendCancellationEmail(cancelledBooking);
        return cancelledBooking;
    }

    public Page<Booking> getUserBookings(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findByUser_IdOrderByBookingTimeDesc(userId, pageable);
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
    }

    public Booking getBookingByNumber(String bookingNumber) {
        return bookingRepository.findByBookingNumber(bookingNumber)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + bookingNumber));
    }

    private double getSeatPrice(Seat.SeatType type, Show show) {
        return switch (type) {
            case REGULAR -> show.getPriceRegular() != null ? show.getPriceRegular() : 150.0;
            case PREMIUM -> show.getPricePremium() != null ? show.getPricePremium() : 250.0;
            case VIP -> show.getPriceVip() != null ? show.getPriceVip() : 400.0;
            case RECLINER -> show.getPriceRecliner() != null ? show.getPriceRecliner() : 600.0;
        };
    }

    private String generateBookingNumber() {
        return "BKG" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
}
