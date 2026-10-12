package com.movietheater.repository;

import com.movietheater.model.Theater;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {

    List<Theater> findByCity(String city);

    Page<Theater> findByOwner_Id(Long ownerId, Pageable pageable);

    Page<Theater> findByStatus(Theater.TheaterStatus status, Pageable pageable);

    @Query("SELECT t FROM Theater t WHERE " +
        "(:city IS NULL OR LOWER(t.city) = LOWER(:city)) AND " +
        "(:state IS NULL OR LOWER(t.state) = LOWER(:state)) AND " +
        "t.status = 'ACTIVE'")
    Page<Theater> findActiveTheaters(
        @Param("city") String city,
        @Param("state") String state,
        Pageable pageable
    );

    @Query("SELECT DISTINCT t.city FROM Theater t WHERE t.status = 'ACTIVE'")
    List<String> findAllActiveCities();
}
