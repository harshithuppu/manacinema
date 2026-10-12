package com.movietheater.service;

import com.movietheater.model.*;
import com.movietheater.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShowService {

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    public Show getShowById(Long id) {
        return showRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Show not found with id: " + id));
    }

    public List<Show> getShowsByMovie(Long movieId) {
        return showRepository.findByMovie_Id(movieId);
    }

    public List<Show> getUpcomingShowsForMovie(Long movieId) {
        return showRepository.findUpcomingShowsForMovie(movieId, LocalDateTime.now());
    }

    public List<Show> getShowsByTheater(Long theaterId) {
        return showRepository.findShowsByTheater(theaterId, LocalDateTime.now());
    }

    public List<Show> getShowsByMovieCityDate(Long movieId, String city, LocalDateTime date) {
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = date.toLocalDate().atTime(23, 59, 59);
        return showRepository.findShowsByMovieAndCityAndDate(movieId, city, startOfDay, endOfDay);
    }

    @Transactional
    public Show createShow(Show show) {
        // Check for conflicts
        Movie movie = movieRepository.findById(show.getMovie().getId())
            .orElseThrow(() -> new EntityNotFoundException("Movie not found"));
        Screen screen = screenRepository.findById(show.getScreen().getId())
            .orElseThrow(() -> new EntityNotFoundException("Screen not found"));

        LocalDateTime endTime = show.getStartTime().plusMinutes(movie.getDurationMinutes() + 15);
        show.setEndTime(endTime);
        show.setMovie(movie);
        show.setScreen(screen);

        List<Show> conflicts = showRepository.findConflictingShows(
            screen.getId(), show.getStartTime(), endTime);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Screen is already booked during this time slot");
        }

        Show saved = showRepository.save(show);

        // Auto-generate ShowSeats from Screen seats
        List<Seat> seats = screen.getSeats();
        for (Seat seat : seats) {
            ShowSeat showSeat = ShowSeat.builder()
                .show(saved)
                .seat(seat)
                .status(ShowSeat.SeatStatus.AVAILABLE)
                .build();
            showSeatRepository.save(showSeat);
        }

        return saved;
    }

    @Transactional
    public Show updateShow(Long id, Show updatedShow) {
        Show existing = getShowById(id);
        existing.setStartTime(updatedShow.getStartTime());
        existing.setPriceRegular(updatedShow.getPriceRegular());
        existing.setPricePremium(updatedShow.getPricePremium());
        existing.setPriceVip(updatedShow.getPriceVip());
        existing.setPriceRecliner(updatedShow.getPriceRecliner());
        existing.setStatus(updatedShow.getStatus());
        return showRepository.save(existing);
    }

    @Transactional
    public void cancelShow(Long id) {
        Show show = getShowById(id);
        show.setStatus(Show.ShowStatus.CANCELLED);
        showRepository.save(show);
    }

    public List<ShowSeat> getShowSeats(Long showId) {
        return showSeatRepository.findByShow_Id(showId);
    }
}
