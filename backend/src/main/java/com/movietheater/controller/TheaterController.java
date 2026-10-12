package com.movietheater.controller;

import com.movietheater.model.*;
import com.movietheater.repository.*;
import com.movietheater.service.TheaterService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/theaters")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TheaterController {

    @Autowired
    private TheaterService theaterService;

    @GetMapping("/public")
    public ResponseEntity<Page<Theater>> getPublicTheaters(
        @RequestParam(required = false) String city,
        @RequestParam(required = false) String state,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(theaterService.getActiveTheaters(city, state, page, size));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Theater> getTheaterById(@PathVariable Long id) {
        return ResponseEntity.ok(theaterService.getTheaterById(id));
    }

    @GetMapping("/public/cities")
    public ResponseEntity<List<String>> getAllCities() {
        return ResponseEntity.ok(theaterService.getAllActiveCities());
    }

    @GetMapping("/manage/my-theaters")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Theater>> getMyTheaters(
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(theaterService.getTheatersByOwner(user.getId(), page, size));
    }

    @PostMapping("/manage")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Theater> createTheater(
        @AuthenticationPrincipal User user,
        @RequestBody Theater theater
    ) {
        return ResponseEntity.ok(theaterService.createTheater(theater, user));
    }

    @PutMapping("/manage/{id}")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Theater> updateTheater(
        @PathVariable Long id,
        @RequestBody Theater theater
    ) {
        return ResponseEntity.ok(theaterService.updateTheater(id, theater));
    }

    @DeleteMapping("/manage/{id}")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTheater(@PathVariable Long id) {
        theaterService.deleteTheater(id);
        return ResponseEntity.ok(Map.of("message", "Theater deleted successfully"));
    }

    @PostMapping("/manage/{theaterId}/screens")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Screen> addScreen(
        @PathVariable Long theaterId,
        @RequestBody Screen screen
    ) {
        return ResponseEntity.ok(theaterService.addScreen(theaterId, screen));
    }

    @GetMapping("/public/{theaterId}/screens")
    public ResponseEntity<List<Screen>> getScreens(@PathVariable Long theaterId) {
        return ResponseEntity.ok(theaterService.getScreensByTheater(theaterId));
    }

    // Admin: approve/reject theater
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Theater> updateTheaterStatus(
        @PathVariable Long id,
        @RequestParam Theater.TheaterStatus status
    ) {
        return ResponseEntity.ok(theaterService.updateTheaterStatus(id, status));
    }
}
