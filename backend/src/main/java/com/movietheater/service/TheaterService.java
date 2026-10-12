package com.movietheater.service;

import com.movietheater.model.*;
import com.movietheater.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TheaterService {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ScreenRepository screenRepository;

    public Page<Theater> getActiveTheaters(String city, String state, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return theaterRepository.findActiveTheaters(city, state, pageable);
    }

    public Theater getTheaterById(Long id) {
        return theaterRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Theater not found with id: " + id));
    }

    public Page<Theater> getTheatersByOwner(Long ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return theaterRepository.findByOwner_Id(ownerId, pageable);
    }

    public List<String> getAllActiveCities() {
        return theaterRepository.findAllActiveCities();
    }

    @Transactional
    public Theater createTheater(Theater theater, User owner) {
        theater.setOwner(owner);
        theater.setStatus(Theater.TheaterStatus.PENDING_APPROVAL);
        return theaterRepository.save(theater);
    }

    @Transactional
    public Theater updateTheater(Long id, Theater updatedTheater) {
        Theater existing = getTheaterById(id);
        existing.setName(updatedTheater.getName());
        existing.setAddress(updatedTheater.getAddress());
        existing.setCity(updatedTheater.getCity());
        existing.setState(updatedTheater.getState());
        existing.setPincode(updatedTheater.getPincode());
        existing.setPhoneNumber(updatedTheater.getPhoneNumber());
        existing.setEmail(updatedTheater.getEmail());
        existing.setAmenities(updatedTheater.getAmenities());
        existing.setImageUrl(updatedTheater.getImageUrl());
        return theaterRepository.save(existing);
    }

    @Transactional
    public void deleteTheater(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new EntityNotFoundException("Theater not found with id: " + id);
        }
        theaterRepository.deleteById(id);
    }

    @Transactional
    public Theater updateTheaterStatus(Long id, Theater.TheaterStatus status) {
        Theater theater = getTheaterById(id);
        theater.setStatus(status);
        return theaterRepository.save(theater);
    }

    @Transactional
    public Screen addScreen(Long theaterId, Screen screen) {
        Theater theater = getTheaterById(theaterId);
        screen.setTheater(theater);

        Screen savedScreen = screenRepository.save(screen);

        // Auto-generate seats
        int rows = (int) Math.ceil(screen.getTotalSeats() / 10.0);
        int seatsPerRow = 10;
        for (int r = 0; r < rows; r++) {
            String rowName = String.valueOf((char) ('A' + r));
            for (int s = 1; s <= seatsPerRow; s++) {
                if ((r * seatsPerRow + s) > screen.getTotalSeats()) break;
                Seat seat = Seat.builder()
                    .rowName(rowName)
                    .seatNumber(s)
                    .seatType(r == 0 ? Seat.SeatType.VIP :
                              r == 1 ? Seat.SeatType.PREMIUM : Seat.SeatType.REGULAR)
                    .screen(savedScreen)
                    .build();
                savedScreen.getSeats().add(seat);
            }
        }
        return screenRepository.save(savedScreen);
    }

    public List<Screen> getScreensByTheater(Long theaterId) {
        return screenRepository.findByTheater_Id(theaterId);
    }
}
