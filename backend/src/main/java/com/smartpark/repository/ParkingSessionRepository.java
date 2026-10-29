package com.smartpark.repository;

import com.smartpark.entity.ParkingSession;
import com.smartpark.entity.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long> {

    @Query("SELECT ps FROM ParkingSession ps JOIN FETCH ps.vehicle JOIN FETCH ps.slot s JOIN FETCH s.location LEFT JOIN FETCH ps.booking WHERE ps.sessionStatus = :status")
    List<ParkingSession> findBySessionStatusWithDetails(@Param("status") SessionStatus status);

    @Query("SELECT ps FROM ParkingSession ps JOIN FETCH ps.vehicle JOIN FETCH ps.slot s JOIN FETCH s.location LEFT JOIN FETCH ps.booking WHERE ps.id = :id")
    Optional<ParkingSession> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT ps FROM ParkingSession ps JOIN FETCH ps.vehicle JOIN FETCH ps.slot s JOIN FETCH s.location LEFT JOIN FETCH ps.booking WHERE ps.vehicle.owner.id = :userId ORDER BY ps.createdAt DESC")
    List<ParkingSession> findByVehicleOwnerIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT ps FROM ParkingSession ps WHERE ps.slot.id = :slotId AND ps.sessionStatus = 'ACTIVE'")
    Optional<ParkingSession> findActiveSessionBySlotId(@Param("slotId") Long slotId);

    @Query("SELECT ps FROM ParkingSession ps WHERE ps.vehicle.id = :vehicleId AND ps.sessionStatus = 'ACTIVE'")
    Optional<ParkingSession> findActiveSessionByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT ps FROM ParkingSession ps WHERE ps.booking.id = :bookingId AND ps.sessionStatus = 'ACTIVE'")
    Optional<ParkingSession> findActiveSessionByBookingId(@Param("bookingId") Long bookingId);

    long countBySessionStatus(SessionStatus status);

    @Query("SELECT COUNT(ps) FROM ParkingSession ps WHERE ps.sessionStatus = 'COMPLETED' AND ps.exitTime >= :from AND ps.exitTime < :to")
    long countCompletedSessionsInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (ps.exit_time - ps.entry_time))) FROM parking_sessions ps WHERE ps.session_status = 'COMPLETED' AND ps.exit_time >= :from AND ps.exit_time < :to", nativeQuery = true)
    Double averageDurationSecondsInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT EXTRACT(HOUR FROM ps.entry_time) as hour, COUNT(ps.id) as cnt FROM parking_sessions ps WHERE ps.entry_time >= :from AND ps.entry_time < :to GROUP BY EXTRACT(HOUR FROM ps.entry_time) ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> findPeakHours(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT ps.slot.id, COUNT(ps) as cnt FROM ParkingSession ps WHERE ps.entryTime >= :from AND ps.entryTime < :to GROUP BY ps.slot.id ORDER BY cnt DESC")
    List<Object[]> findMostUsedSlots(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
