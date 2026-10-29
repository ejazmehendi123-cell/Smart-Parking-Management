package com.smartpark.service;

import com.smartpark.dto.response.*;
import com.smartpark.entity.ParkingLocation;
import com.smartpark.entity.ParkingSlot;
import com.smartpark.entity.enums.*;
import com.smartpark.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final ParkingLocationRepository locationRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReportService(PaymentRepository paymentRepository, ParkingSessionRepository sessionRepository,
                         ParkingSlotRepository slotRepository, ParkingLocationRepository locationRepository,
                         BookingRepository bookingRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.sessionRepository = sessionRepository;
        this.slotRepository = slotRepository;
        this.locationRepository = locationRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueForDate(LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to = date.plusDays(1).atStartOfDay();
        return buildRevenueReport(from, to);
    }

    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueForRange(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        return buildRevenueReport(from, to);
    }

    private RevenueReportResponse buildRevenueReport(LocalDateTime from, LocalDateTime to) {
        BigDecimal totalRevenue = paymentRepository.sumRevenueInRange(from, to);
        long totalSessions = sessionRepository.countCompletedSessionsInRange(from, to);
        Double avgDurationSec = sessionRepository.averageDurationSecondsInRange(from, to);
        Double avgDurationMin = avgDurationSec != null ? avgDurationSec / 60.0 : null;

        // Daily revenue
        List<Object[]> dailyData = paymentRepository.dailyRevenueInRange(from, to);
        List<RevenueReportResponse.DailyRevenue> dailyRevenue = dailyData.stream()
                .map(row -> RevenueReportResponse.DailyRevenue.builder()
                        .date(row[0].toString())
                        .revenue((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList());

        // Monthly revenue
        List<Object[]> monthlyData = paymentRepository.monthlyRevenueInRange(from, to);
        List<RevenueReportResponse.MonthlyRevenue> monthlyRevenue = monthlyData.stream()
                .map(row -> {
                    int year = ((Number) row[0]).intValue();
                    int month = ((Number) row[1]).intValue();
                    return RevenueReportResponse.MonthlyRevenue.builder()
                            .month(year + "-" + String.format("%02d", month))
                            .revenue((BigDecimal) row[2])
                            .build();
                })
                .collect(Collectors.toList());

        // Revenue by method
        Map<String, BigDecimal> revenueByMethod = new LinkedHashMap<>();
        paymentRepository.revenueByMethodInRange(from, to).forEach(row ->
                revenueByMethod.put(((PaymentMethod) row[0]).name(), (BigDecimal) row[1]));

        // Revenue by location
        Map<String, BigDecimal> revenueByLocation = new LinkedHashMap<>();
        Map<Long, String> locationNames = locationRepository.findAll().stream()
                .collect(Collectors.toMap(ParkingLocation::getId, ParkingLocation::getName));
        paymentRepository.revenueByLocationInRange(from, to).forEach(row -> {
            Long locId = ((Number) row[0]).longValue();
            revenueByLocation.put(locationNames.getOrDefault(locId, "Unknown"), (BigDecimal) row[1]);
        });

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalSessions(totalSessions)
                .averageDurationMinutes(avgDurationMin)
                .dailyRevenue(dailyRevenue)
                .monthlyRevenue(monthlyRevenue)
                .revenueByMethod(revenueByMethod)
                .revenueByLocation(revenueByLocation)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalSlots = slotRepository.count();
        long available = slotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupied = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        long reserved = slotRepository.countByStatus(SlotStatus.RESERVED);
        long maintenance = slotRepository.countByStatus(SlotStatus.MAINTENANCE);

        long totalBookings = bookingRepository.count();
        long activeBookings = bookingRepository.countByStatus(BookingStatus.ACTIVE) +
                              bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long customers = userRepository.countByRole(UserRole.CUSTOMER);
        long activeSessions = sessionRepository.countBySessionStatus(SessionStatus.ACTIVE);

        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.plusDays(1).atStartOfDay();
        BigDecimal todayRevenue = paymentRepository.sumRevenueInRange(todayStart, todayEnd);

        LocalDate monthStart = today.withDayOfMonth(1);
        BigDecimal monthRevenue = paymentRepository.sumRevenueInRange(monthStart.atStartOfDay(), todayEnd);

        long todaySessions = sessionRepository.countCompletedSessionsInRange(todayStart, todayEnd);

        return DashboardResponse.builder()
                .totalSlots(totalSlots)
                .availableSlots(available)
                .occupiedSlots(occupied)
                .reservedSlots(reserved)
                .maintenanceSlots(maintenance)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .totalCustomers(customers)
                .activeSessions(activeSessions)
                .todayRevenue(todayRevenue)
                .monthRevenue(monthRevenue)
                .todayCompletedSessions(todaySessions)
                .build();
    }

    @Transactional(readOnly = true)
    public OccupancyResponse getOccupancy() {
        long total = slotRepository.count();
        long occupied = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        long available = slotRepository.countByStatus(SlotStatus.AVAILABLE);
        long reserved = slotRepository.countByStatus(SlotStatus.RESERVED);
        long maintenance = slotRepository.countByStatus(SlotStatus.MAINTENANCE);
        double pct = total > 0 ? (double) occupied / total * 100 : 0;

        List<ParkingLocation> locations = locationRepository.findAll();
        List<OccupancyResponse.LocationOccupancy> byLocation = locations.stream().map(loc -> {
            long locTotal = slotRepository.countByLocationId(loc.getId());
            long locOccupied = slotRepository.countByLocationIdAndStatus(loc.getId(), SlotStatus.OCCUPIED);
            long locAvailable = slotRepository.countByLocationIdAndStatus(loc.getId(), SlotStatus.AVAILABLE);
            double locPct = locTotal > 0 ? (double) locOccupied / locTotal * 100 : 0;
            return OccupancyResponse.LocationOccupancy.builder()
                    .locationId(loc.getId())
                    .locationName(loc.getName())
                    .totalSlots(locTotal)
                    .occupiedSlots(locOccupied)
                    .availableSlots(locAvailable)
                    .occupancyPercentage(Math.round(locPct * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());

        return OccupancyResponse.builder()
                .totalSlots(total)
                .occupiedSlots(occupied)
                .availableSlots(available)
                .reservedSlots(reserved)
                .maintenanceSlots(maintenance)
                .occupancyPercentage(Math.round(pct * 100.0) / 100.0)
                .byLocation(byLocation)
                .build();
    }

    @Transactional(readOnly = true)
    public PeakHoursResponse getPeakHours(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        List<Object[]> data = sessionRepository.findPeakHours(from, to);
        List<PeakHoursResponse.HourUsage> hours = data.stream()
                .map(row -> PeakHoursResponse.HourUsage.builder()
                        .hour(((Number) row[0]).intValue())
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
        return PeakHoursResponse.builder().peakHours(hours).build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = today.plusDays(1).atStartOfDay();
        LocalDateTime monthStartDt = monthStart.atStartOfDay();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("todayRevenue", paymentRepository.sumRevenueInRange(todayStart, todayEnd));
        summary.put("monthRevenue", paymentRepository.sumRevenueInRange(monthStartDt, todayEnd));
        summary.put("todaySessions", sessionRepository.countCompletedSessionsInRange(todayStart, todayEnd));
        summary.put("activeSessions", sessionRepository.countBySessionStatus(SessionStatus.ACTIVE));
        summary.put("totalCustomers", userRepository.countByRole(UserRole.CUSTOMER));
        summary.put("totalBookings", bookingRepository.count());
        return summary;
    }
}
