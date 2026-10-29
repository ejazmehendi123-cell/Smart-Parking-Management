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
public class SlotResponse {
    private Long id;
    private Long locationId;
    private String locationName;
    private String slotNumber;
    private String slotType;
    private String status;
    private String floor;
    private String description;
    private LocalDateTime createdAt;
}
