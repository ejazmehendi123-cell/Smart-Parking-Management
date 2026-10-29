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
public class PaymentResponse {
    private Long id;
    private Long sessionId;
    private String vehicleRegistration;
    private String locationName;
    private String slotNumber;
    private BigDecimal amount;
    private String method;
    private String status;
    private String transactionReference;
    private LocalDateTime paymentTimestamp;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Long durationSeconds;
    private LocalDateTime createdAt;
}
