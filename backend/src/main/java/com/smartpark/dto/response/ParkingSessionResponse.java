package com.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSessionResponse {
    private Long id;
    private Long bookingId;
    private String bookingReference;
    private Long vehicleId;
    private String vehicleRegistration;
    private String vehicleType;
    private Long slotId;
    private String slotNumber;
    private String locationName;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private BigDecimal appliedRate;
    private BigDecimal totalBill;
    private String sessionStatus;
    private Long durationSeconds;
    private BigDecimal estimatedFee;
    private LocalDateTime createdAt;
}
