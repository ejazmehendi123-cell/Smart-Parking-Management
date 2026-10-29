package com.smartpark.repository;

import com.smartpark.entity.ParkingSlot;
import com.smartpark.entity.enums.SlotStatus;
import com.smartpark.entity.enums.SlotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByStatus(SlotStatus status);

    List<ParkingSlot> findByLocationId(Long locationId);

    List<ParkingSlot> findByLocationIdAndStatus(Long locationId, SlotStatus status);

    List<ParkingSlot> findBySlotTypeAndStatus(SlotType slotType, SlotStatus status);

    @Query("SELECT s FROM ParkingSlot s JOIN FETCH s.location WHERE s.status = :status")
    List<ParkingSlot> findByStatusWithLocation(@Param("status") SlotStatus status);

    @Query("SELECT s FROM ParkingSlot s JOIN FETCH s.location")
    List<ParkingSlot> findAllWithLocation();

    @Query("SELECT s FROM ParkingSlot s JOIN FETCH s.location WHERE s.location.id = :locationId")
    List<ParkingSlot> findByLocationIdWithLocation(@Param("locationId") Long locationId);

    long countByStatus(SlotStatus status);

    long countByLocationId(Long locationId);

    long countByLocationIdAndStatus(Long locationId, SlotStatus status);

    boolean existsByLocationIdAndSlotNumber(Long locationId, String slotNumber);

    @Query("SELECT s FROM ParkingSlot s JOIN FETCH s.location WHERE s.location.id = :locationId AND s.slotType = :slotType AND s.status = :status")
    List<ParkingSlot> findByLocationAndTypeAndStatus(@Param("locationId") Long locationId,
                                                     @Param("slotType") SlotType slotType,
                                                     @Param("status") SlotStatus status);
}
