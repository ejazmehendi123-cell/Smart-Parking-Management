package com.smartpark.controller;

import com.smartpark.dto.response.DashboardResponse;
import com.smartpark.dto.response.OccupancyResponse;
import com.smartpark.dto.response.PeakHoursResponse;
import com.smartpark.dto.response.RevenueReportResponse;
import com.smartpark.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Reports & Analytics", description = "Admin & Operator revenue, occupancy, and peak-hour dashboards")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Get high-level dashboard metrics (slots, active bookings, revenue)")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(reportService.getDashboard());
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get detailed revenue report by single date or date range")
    public ResponseEntity<RevenueReportResponse> getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from != null && to != null) {
            return ResponseEntity.ok(reportService.getRevenueForRange(from, to));
        } else if (date != null) {
            return ResponseEntity.ok(reportService.getRevenueForDate(date));
        } else {
            // Default to past 30 days
            LocalDate end = LocalDate.now();
            LocalDate start = end.minusDays(30);
            return ResponseEntity.ok(reportService.getRevenueForRange(start, end));
        }
    }

    @GetMapping("/occupancy")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Get real-time slot occupancy statistics breakdown by location")
    public ResponseEntity<OccupancyResponse> getOccupancy() {
        return ResponseEntity.ok(reportService.getOccupancy());
    }

    @GetMapping("/peak-hours")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Get hourly utilization histogram for given date range")
    public ResponseEntity<PeakHoursResponse> getPeakHours(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from != null ? from : end.minusDays(7);
        return ResponseEntity.ok(reportService.getPeakHours(start, end));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Quick overview KPI summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(reportService.getSummary());
    }
}
