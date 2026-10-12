package com.movietheater.repository;

import com.movietheater.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    List<Show> findByMovie_Id(Long movieId);

    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.startTime >= :from AND s.status = 'SCHEDULED'")
    List<Show> findUpcomingShowsForMovie(
        @Param("movieId") Long movieId,
        @Param("from") LocalDateTime from
    );

    @Query("SELECT s FROM Show s WHERE s.screen.theater.id = :theaterId AND s.startTime >= :from AND s.status = 'SCHEDULED'")
    List<Show> findShowsByTheater(
        @Param("theaterId") Long theaterId,
        @Param("from") LocalDateTime from
    );

    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND " +
        "LOWER(s.screen.theater.city) = LOWER(:city) AND " +
        "s.startTime BETWEEN :startOfDay AND :endOfDay AND " +
        "s.status = 'SCHEDULED'")
    List<Show> findShowsByMovieAndCityAndDate(
        @Param("movieId") Long movieId,
        @Param("city") String city,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("SELECT s FROM Show s WHERE s.screen.id = :screenId AND " +
        "s.startTime <= :endTime AND s.endTime >= :startTime")
    List<Show> findConflictingShows(
        @Param("screenId") Long screenId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}
