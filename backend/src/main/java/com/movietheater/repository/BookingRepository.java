package com.movietheater.repository;

import com.movietheater.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUser_IdOrderByBookingTimeDesc(Long userId, Pageable pageable);

    Optional<Booking> findByBookingNumber(String bookingNumber);

    List<Booking> findByShow_Id(Long showId);

    @Query("SELECT b FROM Booking b WHERE b.show.screen.theater.owner.id = :ownerId ORDER BY b.bookingTime DESC")
    Page<Booking> findBookingsByTheaterOwner(@Param("ownerId") Long ownerId, Pageable pageable);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.show.id = :showId AND b.bookingStatus = 'CONFIRMED'")
    long countConfirmedBookingsForShow(@Param("showId") Long showId);

    @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE b.show.screen.theater.id = :theaterId " +
        "AND b.paymentStatus = 'COMPLETED' AND b.bookingTime BETWEEN :start AND :end")
    Double getTotalRevenueByTheater(@Param("theaterId") Long theaterId,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);
}
