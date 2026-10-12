package com.movietheater.repository;

import com.movietheater.model.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    List<ShowSeat> findByShow_Id(Long showId);

    Optional<ShowSeat> findByShow_IdAndSeat_Id(Long showId, Long seatId);

    List<ShowSeat> findByShow_IdAndStatus(Long showId, ShowSeat.SeatStatus status);

    @Modifying
    @Query("UPDATE ShowSeat ss SET ss.status = :status WHERE ss.show.id = :showId AND ss.seat.id IN :seatIds")
    void updateSeatStatus(@Param("showId") Long showId,
                          @Param("seatIds") List<Long> seatIds,
                          @Param("status") ShowSeat.SeatStatus status);

    @Query("SELECT COUNT(ss) FROM ShowSeat ss WHERE ss.show.id = :showId AND ss.status = 'AVAILABLE'")
    long countAvailableSeats(@Param("showId") Long showId);
}
