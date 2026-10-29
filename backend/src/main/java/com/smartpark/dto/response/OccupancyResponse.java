package com.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyResponse {
    private long totalSlots;
    private long occupiedSlots;
    private long availableSlots;
    private long reservedSlots;
    private long maintenanceSlots;
    private double occupancyPercentage;
    private List<LocationOccupancy> byLocation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationOccupancy {
        private Long locationId;
        private String locationName;
        private long totalSlots;
        private long occupiedSlots;
        private long availableSlots;
        private double occupancyPercentage;
    }
}
