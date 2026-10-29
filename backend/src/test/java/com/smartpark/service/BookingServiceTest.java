package com.smartpark.service;

import com.smartpark.dto.request.BookingRequest;
import com.smartpark.dto.response.BookingResponse;
import com.smartpark.entity.*;
import com.smartpark.entity.enums.*;
import com.smartpark.exception.BadRequestException;
import com.smartpark.exception.ConflictException;
import com.smartpark.exception.UnauthorizedException;
import com.smartpark.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Vehicle car;
    private Vehicle motorcycle;
    private ParkingLocation location;
    private ParkingSlot carSlot;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).fullName("Alice Smith").email("alice@example.com").build();
        car = Vehicle.builder().id(10L).registrationNumber("KA01MJ1111").vehicleType(VehicleType.CAR).owner(user).build();
        motorcycle = Vehicle.builder().id(20L).registrationNumber("KA01MJ2222").vehicleType(VehicleType.MOTORCYCLE).owner(user).build();
        location = ParkingLocation.builder().id(100L).name("Tech Park").build();
        carSlot = ParkingSlot.builder().id(200L).slotNumber("C-01").slotType(SlotType.CAR).status(SlotStatus.AVAILABLE).location(location).build();
    }

    @Test
    @DisplayName("Create booking succeeds with valid parameters")
    void testCreateBookingSuccess() {
        LocalDateTime start = LocalDateTime.now().plusHours(1);
        LocalDateTime end = start.plusHours(2);

        BookingRequest request = new BookingRequest();
        request.setVehicleId(car.getId());
        request.setSlotId(carSlot.getId());
        request.setStartTime(start);
        request.setEndTime(end);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(car.getId())).thenReturn(Optional.of(car));
        when(slotRepository.findById(carSlot.getId())).thenReturn(Optional.of(carSlot));
        when(bookingRepository.findOverlappingBookings(any(), any(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(555L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(1L, request);

        assertNotNull(response);
        assertEquals("CONFIRMED", response.getStatus());
        assertNotNull(response.getBookingReference());
        assertNotNull(response.getQrToken());
        assertEquals("C-01", response.getSlotNumber());
    }

    @Test
    @DisplayName("Prevent booking with another user's vehicle")
    void testPreventBookingWithAnotherUserVehicle() {
        User otherUser = User.builder().id(99L).build();
        Vehicle otherVehicle = Vehicle.builder().id(10L).owner(otherUser).build();

        BookingRequest request = new BookingRequest();
        request.setVehicleId(10L);
        request.setSlotId(200L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(otherVehicle));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                bookingService.createBooking(1L, request));
        assertTrue(ex.getMessage().contains("only book with your own vehicles"));
    }

    @Test
    @DisplayName("Incompatible vehicle type rejected (e.g. Motorcycle on Car slot)")
    void testIncompatibleVehicleType() {
        LocalDateTime start = LocalDateTime.now().plusHours(1);
        LocalDateTime end = start.plusHours(2);

        BookingRequest request = new BookingRequest();
        request.setVehicleId(motorcycle.getId());
        request.setSlotId(carSlot.getId());
        request.setStartTime(start);
        request.setEndTime(end);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(motorcycle.getId())).thenReturn(Optional.of(motorcycle));
        when(slotRepository.findById(carSlot.getId())).thenReturn(Optional.of(carSlot));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(1L, request));
        assertTrue(ex.getMessage().contains("not compatible"));
    }

    @Test
    @DisplayName("Overlapping booking rejected")
    void testOverlappingBookingConflict() {
        LocalDateTime start = LocalDateTime.now().plusHours(1);
        LocalDateTime end = start.plusHours(2);

        BookingRequest request = new BookingRequest();
        request.setVehicleId(car.getId());
        request.setSlotId(carSlot.getId());
        request.setStartTime(start);
        request.setEndTime(end);

        Booking existing = Booking.builder().id(888L).startTime(start).endTime(end).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(car.getId())).thenReturn(Optional.of(car));
        when(slotRepository.findById(carSlot.getId())).thenReturn(Optional.of(carSlot));
        when(bookingRepository.findOverlappingBookings(any(), any(), any(), any())).thenReturn(List.of(existing));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                bookingService.createBooking(1L, request));
        assertTrue(ex.getMessage().contains("already booked"));
    }
}
