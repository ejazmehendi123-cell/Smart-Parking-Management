package com.smartpark.repository;

import com.smartpark.entity.ParkingLocation;
import com.smartpark.entity.enums.LocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingLocationRepository extends JpaRepository<ParkingLocation, Long> {
    List<ParkingLocation> findByStatus(LocationStatus status);
}
