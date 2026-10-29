package com.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long vehicleId;
    private String vehicleRegistration;
    private String vehicleType;
    private Long slotId;
    private String slotNumber;
    private String slotType;
    private String locationName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String bookingReference;
    private String qrToken;
    private String status;
    private LocalDateTime createdAt;
}
