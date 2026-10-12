package com.movietheater.controller;

import com.movietheater.model.*;
import com.movietheater.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shows")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ShowController {

    @Autowired
    private ShowService showService;

    @GetMapping("/public/{id}")
    public ResponseEntity<Show> getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @GetMapping("/public/movie/{movieId}")
    public ResponseEntity<List<Show>> getShowsByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(showService.getUpcomingShowsForMovie(movieId));
    }

    @GetMapping("/public/movie/{movieId}/search")
    public ResponseEntity<List<Show>> getShowsByMovieCityDate(
        @PathVariable Long movieId,
        @RequestParam String city,
        @RequestParam String date
    ) {
        LocalDateTime dateTime = LocalDate.parse(date).atStartOfDay();
        return ResponseEntity.ok(showService.getShowsByMovieCityDate(movieId, city, dateTime));
    }

    @GetMapping("/public/theater/{theaterId}")
    public ResponseEntity<List<Show>> getShowsByTheater(@PathVariable Long theaterId) {
        return ResponseEntity.ok(showService.getShowsByTheater(theaterId));
    }

    @GetMapping("/public/{showId}/seats")
    public ResponseEntity<List<ShowSeat>> getShowSeats(@PathVariable Long showId) {
        return ResponseEntity.ok(showService.getShowSeats(showId));
    }

    @PostMapping("/manage")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Show> createShow(@RequestBody Show show) {
        return ResponseEntity.ok(showService.createShow(show));
    }

    @PutMapping("/manage/{id}")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Show> updateShow(@PathVariable Long id, @RequestBody Show show) {
        return ResponseEntity.ok(showService.updateShow(id, show));
    }

    @DeleteMapping("/manage/{id}")
    @PreAuthorize("hasRole('THEATER_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> cancelShow(@PathVariable Long id) {
        showService.cancelShow(id);
        return ResponseEntity.ok(Map.of("message", "Show cancelled successfully"));
    }
}
