package com.movietheater.controller;

import com.movietheater.model.*;
import com.movietheater.repository.*;
import com.movietheater.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TheaterService theaterService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalMovies", movieRepository.count());
        stats.put("totalTheaters", theaterRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("pendingTheaters",
            theaterRepository.findByStatus(Theater.TheaterStatus.PENDING_APPROVAL,
                PageRequest.of(0, 100)).getTotalElements());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(userRepository.findAll(PageRequest.of(page, size)));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
        user.setEnabled(!user.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/theaters/pending")
    public ResponseEntity<Page<Theater>> getPendingTheaters(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(theaterRepository.findByStatus(
            Theater.TheaterStatus.PENDING_APPROVAL, PageRequest.of(page, size)));
    }

    @PutMapping("/theaters/{id}/approve")
    public ResponseEntity<Theater> approveTheater(@PathVariable Long id) {
        return ResponseEntity.ok(theaterService.updateTheaterStatus(id, Theater.TheaterStatus.ACTIVE));
    }

    @PutMapping("/theaters/{id}/reject")
    public ResponseEntity<Theater> rejectTheater(@PathVariable Long id) {
        return ResponseEntity.ok(theaterService.updateTheaterStatus(id, Theater.TheaterStatus.INACTIVE));
    }

    @GetMapping("/bookings")
    public ResponseEntity<Page<Booking>> getAllBookings(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(bookingRepository.findAll(PageRequest.of(page, size,
            Sort.by("bookingTime").descending())));
    }
}
