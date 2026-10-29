package com.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeakHoursResponse {
    private List<HourUsage> peakHours;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourUsage {
        private int hour;
        private long count;
    }
}
