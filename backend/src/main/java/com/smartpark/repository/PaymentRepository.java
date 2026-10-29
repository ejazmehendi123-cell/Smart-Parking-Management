package com.smartpark.repository;

import com.smartpark.entity.Payment;
import com.smartpark.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p JOIN FETCH p.session ps JOIN FETCH ps.vehicle JOIN FETCH ps.slot s JOIN FETCH s.location WHERE p.id = :id")
    Optional<Payment> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT p FROM Payment p JOIN FETCH p.session ps JOIN FETCH ps.vehicle v WHERE v.owner.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdWithDetails(@Param("userId") Long userId);

    List<Payment> findBySessionId(Long sessionId);

    Optional<Payment> findByTransactionReference(String transactionReference);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'PAID' AND p.paymentTimestamp >= :from AND p.paymentTimestamp < :to")
    BigDecimal sumRevenueInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT CAST(p.payment_timestamp AS DATE), SUM(p.amount) FROM payments p WHERE p.status = 'PAID' AND p.payment_timestamp >= :from AND p.payment_timestamp < :to GROUP BY CAST(p.payment_timestamp AS DATE) ORDER BY CAST(p.payment_timestamp AS DATE)", nativeQuery = true)
    List<Object[]> dailyRevenueInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT EXTRACT(YEAR FROM p.payment_timestamp) as yr, EXTRACT(MONTH FROM p.payment_timestamp) as mo, SUM(p.amount) FROM payments p WHERE p.status = 'PAID' AND p.payment_timestamp >= :from AND p.payment_timestamp < :to GROUP BY EXTRACT(YEAR FROM p.payment_timestamp), EXTRACT(MONTH FROM p.payment_timestamp) ORDER BY yr, mo", nativeQuery = true)
    List<Object[]> monthlyRevenueInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT p.method, SUM(p.amount) FROM Payment p WHERE p.status = 'PAID' AND p.paymentTimestamp >= :from AND p.paymentTimestamp < :to GROUP BY p.method")
    List<Object[]> revenueByMethodInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT s.location.id, SUM(p.amount) FROM Payment p JOIN p.session ps JOIN ps.slot s WHERE p.status = 'PAID' AND p.paymentTimestamp >= :from AND p.paymentTimestamp < :to GROUP BY s.location.id")
    List<Object[]> revenueByLocationInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    long countByStatus(PaymentStatus status);
}
