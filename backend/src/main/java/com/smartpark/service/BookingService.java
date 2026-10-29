package com.smartpark.service;

import com.smartpark.dto.request.BookingRequest;
import com.smartpark.dto.response.BookingResponse;
import com.smartpark.entity.*;
import com.smartpark.entity.enums.*;
import com.smartpark.exception.*;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public BookingService(BookingRepository bookingRepository, ParkingSlotRepository slotRepository,
                          VehicleRepository vehicleRepository, UserRepository userRepository,
                          AuditService auditService) {
        this.bookingRepository = bookingRepository;
        this.slotRepository = slotRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        // Ownership check
        if (!vehicle.getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only book with your own vehicles");
        }

        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking Slot", request.getSlotId()));

        // Validate timestamps
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }
        if (request.getStartTime().isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new BadRequestException("Start time cannot be in the past");
        }

        // Validate vehicle type compatibility
        if (!isCompatibleType(vehicle.getVehicleType(), slot.getSlotType())) {
            throw new BadRequestException("Vehicle type " + vehicle.getVehicleType() +
                    " is not compatible with slot type " + slot.getSlotType());
        }

        // Check for overlapping bookings
        List<BookingStatus> activeStatuses = List.of(BookingStatus.CONFIRMED, BookingStatus.ACTIVE);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                slot.getId(), request.getStartTime(), request.getEndTime(), activeStatuses);
        if (!overlapping.isEmpty()) {
            throw new ConflictException("Slot is already booked for the requested time period");
        }

        // Check slot is not in maintenance
        if (slot.getStatus() == SlotStatus.MAINTENANCE) {
            throw new BadRequestException("Slot is under maintenance and cannot be booked");
        }

        // Create booking
        String bookingRef = generateBookingReference();
        String qrToken = generateQrToken();

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .slot(slot)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .bookingReference(bookingRef)
                .qrToken(qrToken)
                .status(BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);

        // Update slot status to RESERVED if booking starts now
        if (request.getStartTime().isBefore(LocalDateTime.now().plusMinutes(30))) {
            slot.setStatus(SlotStatus.RESERVED);
            slotRepository.save(slot);
        }

        auditService.log(user, "BOOKING_CREATED", "BOOKING", booking.getId(), "ref=" + bookingRef);
        auditService.notify(user, "Booking confirmed! Reference: " + bookingRef +
                ". Slot: " + slot.getSlotNumber() + " at " + slot.getLocation().getName(),
                NotificationType.BOOKING_CONFIRMED);

        log.info("Booking created: {} for user {} slot {}", bookingRef, userId, slot.getSlotNumber());

        return EntityMapper.toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId, String status) {
        List<Booking> bookings;
        if (status != null && !status.isEmpty()) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookings = bookingRepository.findByUserIdAndStatusWithDetails(userId, bookingStatus);
        } else {
            bookings = bookingRepository.findByUserIdWithDetails(userId);
        }
        return bookings.stream().map(EntityMapper::toBookingResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));
        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only view your own bookings");
        }
        return EntityMapper.toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Only confirmed bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Release slot if reserved
        ParkingSlot slot = booking.getSlot();
        if (slot.getStatus() == SlotStatus.RESERVED) {
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }

        User user = booking.getUser();
        auditService.log(user, "BOOKING_CANCELLED", "BOOKING", booking.getId(), null);
        auditService.notify(user, "Booking " + booking.getBookingReference() + " has been cancelled.",
                NotificationType.BOOKING_CANCELLED);

        return EntityMapper.toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingTicket(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));
        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only view your own booking tickets");
        }
        return EntityMapper.toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllWithDetails().stream()
                .map(EntityMapper::toBookingResponse).collect(Collectors.toList());
    }

    private boolean isCompatibleType(VehicleType vehicleType, SlotType slotType) {
        return switch (slotType) {
            case CAR -> vehicleType == VehicleType.CAR;
            case MOTORCYCLE -> vehicleType == VehicleType.MOTORCYCLE;
            case EV -> vehicleType == VehicleType.EV;
            case ACCESSIBLE -> vehicleType == VehicleType.CAR || vehicleType == VehicleType.EV;
        };
    }

    private String generateBookingReference() {
        return "SP-" + System.currentTimeMillis() % 100000000;
    }

    private String generateQrToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
