package com.smartpark.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ParkingEntryRequest {
    private Long bookingId;

    private Long vehicleId;

    private String registrationNumber;

    @NotNull(message = "Slot ID is required")
    private Long slotId;
}
