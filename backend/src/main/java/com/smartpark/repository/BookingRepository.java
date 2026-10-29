package com.smartpark.repository;

import com.smartpark.entity.Booking;
import com.smartpark.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle JOIN FETCH b.slot s JOIN FETCH s.location JOIN FETCH b.user WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle JOIN FETCH b.slot s JOIN FETCH s.location JOIN FETCH b.user WHERE b.user.id = :userId AND b.status = :status ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdAndStatusWithDetails(@Param("userId") Long userId, @Param("status") BookingStatus status);

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle JOIN FETCH b.slot s JOIN FETCH s.location JOIN FETCH b.user WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    Optional<Booking> findByBookingReference(String bookingReference);
    Optional<Booking> findByQrToken(String qrToken);

    @Query("SELECT b FROM Booking b WHERE b.slot.id = :slotId AND b.status IN :statuses AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findOverlappingBookings(@Param("slotId") Long slotId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime,
                                          @Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.startTime < :cutoffTime")
    List<Booking> findExpiredBookings(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle JOIN FETCH b.slot s JOIN FETCH s.location JOIN FETCH b.user ORDER BY b.createdAt DESC")
    List<Booking> findAllWithDetails();

    long countByStatus(BookingStatus status);
}
