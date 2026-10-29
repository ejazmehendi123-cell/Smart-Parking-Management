package com.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeEstimateResponse {
    private Long sessionId;
    private Long durationSeconds;
    private String durationFormatted;
    private BigDecimal estimatedFee;
    private BigDecimal ratePerBlock;
    private Integer blockHours;
}
