package com.smartpark.mapper;

import com.smartpark.dto.response.*;
import com.smartpark.entity.*;
import com.smartpark.service.PricingService;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Centralized mapper for converting entities to DTOs.
 * Avoids exposing JPA entities directly in API responses.
 */
public final class EntityMapper {

    private EntityMapper() {}

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accountStatus(user.getAccountStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static LocationResponse toLocationResponse(ParkingLocation location, long totalSlots, long availableSlots) {
        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .address(location.getAddress())
                .description(location.getDescription())
                .status(location.getStatus().name())
                .totalSlots(totalSlots)
                .availableSlots(availableSlots)
                .createdAt(location.getCreatedAt())
                .build();
    }

    public static SlotResponse toSlotResponse(ParkingSlot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .locationId(slot.getLocation().getId())
                .locationName(slot.getLocation().getName())
                .slotNumber(slot.getSlotNumber())
                .slotType(slot.getSlotType().name())
                .status(slot.getStatus().name())
                .floor(slot.getFloor())
                .description(slot.getDescription())
                .createdAt(slot.getCreatedAt())
                .build();
    }

    public static VehicleResponse toVehicleResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .vehicleType(vehicle.getVehicleType().name())
                .createdAt(vehicle.getCreatedAt())
                .build();
    }

    public static BookingResponse toBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getFullName())
                .vehicleId(booking.getVehicle().getId())
                .vehicleRegistration(booking.getVehicle().getRegistrationNumber())
                .vehicleType(booking.getVehicle().getVehicleType().name())
                .slotId(booking.getSlot().getId())
                .slotNumber(booking.getSlot().getSlotNumber())
                .slotType(booking.getSlot().getSlotType().name())
                .locationName(booking.getSlot().getLocation().getName())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .bookingReference(booking.getBookingReference())
                .qrToken(booking.getQrToken())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public static ParkingSessionResponse toSessionResponse(ParkingSession session, PricingService pricingService) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = session.getExitTime() != null ? session.getExitTime() : now;
        long durationSeconds = Duration.between(session.getEntryTime(), end).getSeconds();
        BigDecimal estimatedFee = null;
        if (session.getSessionStatus().name().equals("ACTIVE")) {
            estimatedFee = pricingService.calculateFee(session.getEntryTime(), now);
        }

        return ParkingSessionResponse.builder()
                .id(session.getId())
                .bookingId(session.getBooking() != null ? session.getBooking().getId() : null)
                .bookingReference(session.getBooking() != null ? session.getBooking().getBookingReference() : null)
                .vehicleId(session.getVehicle().getId())
                .vehicleRegistration(session.getVehicle().getRegistrationNumber())
                .vehicleType(session.getVehicle().getVehicleType().name())
                .slotId(session.getSlot().getId())
                .slotNumber(session.getSlot().getSlotNumber())
                .locationName(session.getSlot().getLocation().getName())
                .entryTime(session.getEntryTime())
                .exitTime(session.getExitTime())
                .appliedRate(session.getAppliedRate())
                .totalBill(session.getTotalBill())
                .sessionStatus(session.getSessionStatus().name())
                .durationSeconds(durationSeconds)
                .estimatedFee(estimatedFee)
                .createdAt(session.getCreatedAt())
                .build();
    }

    public static PaymentResponse toPaymentResponse(Payment payment) {
        ParkingSession session = payment.getSession();
        long durationSeconds = 0;
        if (session.getExitTime() != null) {
            durationSeconds = Duration.between(session.getEntryTime(), session.getExitTime()).getSeconds();
        }
        return PaymentResponse.builder()
                .id(payment.getId())
                .sessionId(session.getId())
                .vehicleRegistration(session.getVehicle().getRegistrationNumber())
                .locationName(session.getSlot().getLocation().getName())
                .slotNumber(session.getSlot().getSlotNumber())
                .amount(payment.getAmount())
                .method(payment.getMethod().name())
                .status(payment.getStatus().name())
                .transactionReference(payment.getTransactionReference())
                .paymentTimestamp(payment.getPaymentTimestamp())
                .entryTime(session.getEntryTime())
                .exitTime(session.getExitTime())
                .durationSeconds(durationSeconds)
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public static NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public static AuditLogResponse toAuditLogResponse(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .actorName(auditLog.getActor() != null ? auditLog.getActor().getFullName() : "SYSTEM")
                .actorEmail(auditLog.getActor() != null ? auditLog.getActor().getEmail() : null)
                .action(auditLog.getAction())
                .resourceType(auditLog.getResourceType())
                .resourceId(auditLog.getResourceId())
                .metadata(auditLog.getMetadata())
                .timestamp(auditLog.getTimestamp())
                .build();
    }
}
