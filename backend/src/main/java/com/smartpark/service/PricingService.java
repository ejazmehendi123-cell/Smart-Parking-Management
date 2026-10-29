package com.smartpark.service;

import com.smartpark.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Pricing engine for parking fee calculation.
 *
 * Mandatory rule: ₹50 for every 3-hour block or fraction thereof.
 * fee = 50 × ceil(duration_seconds / 10800)
 *
 * Zero duration (identical entry and exit) = ₹0
 * Negative duration = rejected
 */
@Service
public class PricingService {

    private static final BigDecimal RATE_PER_BLOCK = new BigDecimal("50.00");
    private static final long BLOCK_SECONDS = 3 * 60 * 60; // 10800 seconds = 3 hours

    /**
     * Calculate parking fee based on entry and exit times.
     */
    public BigDecimal calculateFee(LocalDateTime entryTime, LocalDateTime exitTime) {
        if (entryTime == null || exitTime == null) {
            throw new BadRequestException("Entry time and exit time must not be null");
        }
        if (exitTime.isBefore(entryTime)) {
            throw new BadRequestException("Exit time cannot be before entry time");
        }

        Duration duration = Duration.between(entryTime, exitTime);
        long totalSeconds = duration.getSeconds();

        // Zero duration = ₹0
        if (totalSeconds == 0) {
            return BigDecimal.ZERO;
        }

        // ceil(totalSeconds / BLOCK_SECONDS)
        long blocks = (totalSeconds + BLOCK_SECONDS - 1) / BLOCK_SECONDS;

        return RATE_PER_BLOCK.multiply(BigDecimal.valueOf(blocks));
    }

    /**
     * Get the current rate per block for display.
     */
    public BigDecimal getRatePerBlock() {
        return RATE_PER_BLOCK;
    }

    /**
     * Get block size in hours.
     */
    public int getBlockHours() {
        return 3;
    }

    /**
     * Format duration as human-readable string.
     */
    public String formatDuration(long totalSeconds) {
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        if (hours > 0) {
            return hours + "h " + minutes + "m";
        }
        return minutes + "m";
    }
}
