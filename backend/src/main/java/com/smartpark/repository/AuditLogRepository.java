package com.smartpark.repository;

import com.smartpark.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.actor ORDER BY a.timestamp DESC")
    Page<AuditLog> findAllWithActor(Pageable pageable);
}
