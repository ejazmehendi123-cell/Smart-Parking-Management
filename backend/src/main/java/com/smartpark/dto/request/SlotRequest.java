package com.smartpark.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SlotRequest {
    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotBlank(message = "Slot number is required")
    private String slotNumber;

    @NotNull(message = "Slot type is required")
    private String slotType;

    private String status;
    private String floor;
    private String description;
}
