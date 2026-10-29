package com.smartpark.controller;

import com.smartpark.dto.response.FeeEstimateResponse;
import com.smartpark.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/pricing")
@Tag(name = "Pricing & Fare Engine", description = "Real-time fare calculation and fee structure rules")
public class PricingController {

    private final PricingService pricingService;

    public PricingController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    @GetMapping("/calculate")
    @Operation(summary = "Calculate parking fee between entry and exit timestamps (or accrued up to current time)")
    public ResponseEntity<FeeEstimateResponse> calculateFee(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime entryTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime exitTime) {

        LocalDateTime effectiveExitTime = exitTime != null ? exitTime : LocalDateTime.now();
        BigDecimal fee = pricingService.calculateFee(entryTime, effectiveExitTime);
        long durationSeconds = Duration.between(entryTime, effectiveExitTime).getSeconds();

        FeeEstimateResponse response = FeeEstimateResponse.builder()
                .durationSeconds(durationSeconds)
                .durationFormatted(pricingService.formatDuration(durationSeconds))
                .estimatedFee(fee)
                .ratePerBlock(pricingService.getRatePerBlock())
                .blockHours(pricingService.getBlockHours())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/fare-by-minutes")
    @Operation(summary = "Calculate parking fee for a given duration in minutes (e.g. 135 mins = 2h 15m -> ₹50)")
    public ResponseEntity<FeeEstimateResponse> calculateByMinutes(@RequestParam long durationMinutes) {
        LocalDateTime entryTime = LocalDateTime.now();
        LocalDateTime exitTime = entryTime.plusMinutes(durationMinutes);
        BigDecimal fee = pricingService.calculateFee(entryTime, exitTime);
        long durationSeconds = durationMinutes * 60;

        FeeEstimateResponse response = FeeEstimateResponse.builder()
                .durationSeconds(durationSeconds)
                .durationFormatted(pricingService.formatDuration(durationSeconds))
                .estimatedFee(fee)
                .ratePerBlock(pricingService.getRatePerBlock())
                .blockHours(pricingService.getBlockHours())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/rules")
    @Operation(summary = "Get official pricing engine rules and rate structure")
    public ResponseEntity<Map<String, Object>> getRules() {
        return ResponseEntity.ok(Map.of(
                "ratePerBlock", pricingService.getRatePerBlock(),
                "blockHours", pricingService.getBlockHours(),
                "currency", "INR",
                "formula", "fee = 50.00 * ceil(duration_seconds / 10800)",
                "examples", Map.of(
                        "0_seconds", "₹0.00",
                        "2h_15m (135m)", "₹50.00",
                        "3h_00m (180m)", "₹50.00",
                        "3h_05m (185m)", "₹100.00",
                        "6h_01m (361m)", "₹150.00"
                )
        ));
    }
}

