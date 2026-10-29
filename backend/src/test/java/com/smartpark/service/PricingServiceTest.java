package com.smartpark.service;

import com.smartpark.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PricingService Unit Tests")
class PricingServiceTest {

    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingService();
    }

    @Test
    @DisplayName("Assignment Example 1: 2 hours 15 mins should cost ₹50")
    void testAssignmentExampleOne() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 12, 15, 0); // 2h 15m
        BigDecimal fee = pricingService.calculateFee(entry, exit);
        assertEquals(new BigDecimal("50.00"), fee);
    }

    @Test
    @DisplayName("Assignment Example 2: 3 hours 5 mins should cost ₹100")
    void testAssignmentExampleTwo() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 13, 5, 0); // 3h 5m
        BigDecimal fee = pricingService.calculateFee(entry, exit);
        assertEquals(new BigDecimal("100.00"), fee);
    }

    @Test
    @DisplayName("Null entry or exit time throws BadRequestException")
    void testNullTimes() {
        LocalDateTime now = LocalDateTime.now();
        assertThrows(BadRequestException.class, () -> pricingService.calculateFee(null, now));
        assertThrows(BadRequestException.class, () -> pricingService.calculateFee(now, null));
    }

    @Test
    @DisplayName("Zero duration should result in ₹0 fee")
    void testZeroDuration() {
        LocalDateTime time = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        BigDecimal fee = pricingService.calculateFee(time, time);
        assertEquals(0, fee.compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Exit time before entry time should throw BadRequestException")
    void testNegativeDurationThrowsException() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 9, 0, 0);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                pricingService.calculateFee(entry, exit));
        assertTrue(ex.getMessage().contains("cannot be before entry time"));
    }

    @Test
    @DisplayName("Partial duration within first 3-hour block (e.g. 1 hour) charged as full block (₹50)")
    void testPartialFirstBlock() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 11, 0, 0); // 1 hour

        BigDecimal fee = pricingService.calculateFee(entry, exit);
        assertEquals(new BigDecimal("50.00"), fee);
    }

    @Test
    @DisplayName("Exactly 3 hours should charge exactly 1 block (₹50)")
    void testExactThreeHours() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 13, 0, 0); // 3 hours

        BigDecimal fee = pricingService.calculateFee(entry, exit);
        assertEquals(new BigDecimal("50.00"), fee);
    }

    @Test
    @DisplayName("3 hours and 1 minute should ceil to 2 blocks (₹100)")
    void testThreeHoursOneMinuteCeil() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 13, 1, 0); // 3 hrs 1 min

        BigDecimal fee = pricingService.calculateFee(entry, exit);
        assertEquals(new BigDecimal("100.00"), fee);
    }

    @Test
    @DisplayName("Exactly 6 hours should charge 2 blocks (₹100)")
    void testExactSixHours() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 16, 0, 0); // 6 hours

        BigDecimal fee = pricingService.calculateFee(entry, exit);
        assertEquals(new BigDecimal("100.00"), fee);
    }

    @Test
    @DisplayName("6 hours and 1 minute should ceil to 3 blocks (₹150)")
    void testSixHoursOneMinuteCeil() {
        LocalDateTime entry = LocalDateTime.of(2026, 10, 25, 10, 0, 0);
        LocalDateTime exit = LocalDateTime.of(2026, 10, 25, 16, 1, 0); // 6 hrs 1 min

        BigDecimal fee = pricingService.calculateFee(entry, exit);
        assertEquals(new BigDecimal("150.00"), fee);
    }

    @Test
    @DisplayName("Formatting seconds into human readable duration")
    void testFormatDuration() {
        assertEquals("0m", pricingService.formatDuration(0));
        assertEquals("0m", pricingService.formatDuration(45));
        assertEquals("2m", pricingService.formatDuration(135));
        assertEquals("2h 15m", pricingService.formatDuration(8130));
    }
}
