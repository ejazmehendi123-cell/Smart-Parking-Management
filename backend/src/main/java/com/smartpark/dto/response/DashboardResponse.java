package com.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalSlots;
    private long availableSlots;
    private long occupiedSlots;
    private long reservedSlots;
    private long maintenanceSlots;
    private long totalBookings;
    private long activeBookings;
    private long totalCustomers;
    private long activeSessions;
    private BigDecimal todayRevenue;
    private BigDecimal monthRevenue;
    private long todayCompletedSessions;
}
