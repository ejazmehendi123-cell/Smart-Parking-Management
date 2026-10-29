package com.smartpark.service;

import com.smartpark.dto.request.ParkingEntryRequest;
import com.smartpark.dto.request.QrVerifyRequest;
import com.smartpark.dto.response.FeeEstimateResponse;
import com.smartpark.dto.response.ParkingSessionResponse;
import com.smartpark.entity.*;
import com.smartpark.entity.enums.*;
import com.smartpark.exception.*;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingService {

    private static final Logger log = LoggerFactory.getLogger(ParkingService.class);

    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PricingService pricingService;
    private final AuditService auditService;
    private final UserRepository userRepository;

    public ParkingService(ParkingSessionRepository sessionRepository, ParkingSlotRepository slotRepository,
                          VehicleRepository vehicleRepository, BookingRepository bookingRepository,
                          PricingService pricingService, AuditService auditService, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.slotRepository = slotRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.pricingService = pricingService;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @Transactional
    public ParkingSessionResponse createEntry(ParkingEntryRequest request, Long operatorId) {
        Vehicle vehicle;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));
        } else if (request.getRegistrationNumber() != null && !request.getRegistrationNumber().isBlank()) {
            vehicle = vehicleRepository.findByRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "registrationNumber", request.getRegistrationNumber()));
        } else {
            throw new BadRequestException("Either vehicleId or registrationNumber must be provided");
        }

        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking Slot", request.getSlotId()));

        // Check for duplicate active session on this vehicle
        sessionRepository.findActiveSessionByVehicleId(vehicle.getId()).ifPresent(s -> {
            throw new ConflictException("Vehicle already has an active parking session");
        });

        // Check for duplicate active session on this slot
        sessionRepository.findActiveSessionBySlotId(slot.getId()).ifPresent(s -> {
            throw new ConflictException("Slot already has an active parking session");
        });

        // Check slot is available or reserved for this booking
        if (slot.getStatus() == SlotStatus.MAINTENANCE) {
            throw new BadRequestException("Slot is under maintenance");
        }
        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new ConflictException("Slot is already occupied");
        }

        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId()));

            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new BadRequestException("Booking is not in CONFIRMED status. Current: " + booking.getStatus());
            }

            // Prevent duplicate check-in
            sessionRepository.findActiveSessionByBookingId(booking.getId()).ifPresent(s -> {
                throw new ConflictException("Booking already has an active session");
            });

            booking.setStatus(BookingStatus.ACTIVE);
            bookingRepository.save(booking);
        }

        // Create session
        LocalDateTime now = LocalDateTime.now();
        ParkingSession session = ParkingSession.builder()
                .booking(booking)
                .vehicle(vehicle)
                .slot(slot)
                .entryTime(now)
                .appliedRate(pricingService.getRatePerBlock())
                .sessionStatus(SessionStatus.ACTIVE)
                .build();
        session = sessionRepository.save(session);

        // Update slot status
        slot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);

        User operator = userRepository.findById(operatorId).orElse(null);
        auditService.log(operator, "PARKING_ENTRY", "SESSION", session.getId(),
                "vehicle=" + vehicle.getRegistrationNumber() + ",slot=" + slot.getSlotNumber());
        auditService.notify(vehicle.getOwner(), "Your vehicle " + vehicle.getRegistrationNumber() +
                " has entered parking slot " + slot.getSlotNumber(), NotificationType.PARKING_ENTRY);

        log.info("Parking entry: vehicle={} slot={} session={}", vehicle.getRegistrationNumber(), slot.getSlotNumber(), session.getId());

        return EntityMapper.toSessionResponse(session, pricingService);
    }

    @Transactional
    public ParkingSessionResponse verifyQrAndEntry(QrVerifyRequest request, Long operatorId) {
        Booking booking = bookingRepository.findByQrToken(request.getQrToken())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "qrToken", request.getQrToken()));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking has been cancelled");
        }
        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new BadRequestException("Booking has expired");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking has already been completed");
        }
        if (booking.getStatus() == BookingStatus.ACTIVE) {
            throw new ConflictException("Booking already has an active parking session");
        }

        ParkingEntryRequest entryRequest = new ParkingEntryRequest();
        entryRequest.setBookingId(booking.getId());
        entryRequest.setVehicleId(booking.getVehicle().getId());
        entryRequest.setSlotId(booking.getSlot().getId());

        return createEntry(entryRequest, operatorId);
    }

    @Transactional(readOnly = true)
    public List<ParkingSessionResponse> getActiveSessions() {
        return sessionRepository.findBySessionStatusWithDetails(SessionStatus.ACTIVE).stream()
                .map(s -> EntityMapper.toSessionResponse(s, pricingService))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParkingSessionResponse> getMySessions(Long userId) {
        return sessionRepository.findByVehicleOwnerIdWithDetails(userId).stream()
                .map(s -> EntityMapper.toSessionResponse(s, pricingService))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FeeEstimateResponse getEstimate(Long sessionId, Long userId, boolean isAdmin) {
        ParkingSession session = sessionRepository.findByIdWithDetails(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking Session", sessionId));

        if (!isAdmin && !session.getVehicle().getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only view estimates for your own sessions");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime entryTime = session.getEntryTime();
        long durationSeconds = Duration.between(entryTime, now).getSeconds();
        BigDecimal estimatedFee = pricingService.calculateFee(entryTime, now);

        return FeeEstimateResponse.builder()
                .sessionId(session.getId())
                .durationSeconds(durationSeconds)
                .durationFormatted(pricingService.formatDuration(durationSeconds))
                .estimatedFee(estimatedFee)
                .ratePerBlock(pricingService.getRatePerBlock())
                .blockHours(pricingService.getBlockHours())
                .build();
    }

    @Transactional
    public ParkingSessionResponse checkout(Long sessionId, Long operatorId) {
        ParkingSession session = sessionRepository.findByIdWithDetails(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking Session", sessionId));

        if (session.getSessionStatus() != SessionStatus.ACTIVE) {
            throw new ConflictException("Session is not active. Current status: " + session.getSessionStatus());
        }

        LocalDateTime exitTime = LocalDateTime.now();
        BigDecimal totalBill = pricingService.calculateFee(session.getEntryTime(), exitTime);

        session.setExitTime(exitTime);
        session.setTotalBill(totalBill);
        session.setAppliedRate(pricingService.getRatePerBlock());
        session.setSessionStatus(SessionStatus.COMPLETED);
        sessionRepository.save(session);

        // Update booking status if applicable
        if (session.getBooking() != null) {
            Booking booking = session.getBooking();
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        // Release the slot
        ParkingSlot slot = session.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        User operator = userRepository.findById(operatorId).orElse(null);
        auditService.log(operator, "PARKING_CHECKOUT", "SESSION", session.getId(),
                "bill=" + totalBill + ",vehicle=" + session.getVehicle().getRegistrationNumber());
        auditService.notify(session.getVehicle().getOwner(),
                "Checkout complete for vehicle " + session.getVehicle().getRegistrationNumber() +
                ". Total bill: ₹" + totalBill, NotificationType.PARKING_CHECKOUT);

        log.info("Parking checkout: session={} bill={}", session.getId(), totalBill);

        return EntityMapper.toSessionResponse(session, pricingService);
    }
}
