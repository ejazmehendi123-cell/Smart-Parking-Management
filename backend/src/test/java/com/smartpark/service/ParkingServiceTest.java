package com.smartpark.service;

import com.smartpark.dto.request.ParkingEntryRequest;
import com.smartpark.dto.response.ParkingSessionResponse;
import com.smartpark.entity.*;
import com.smartpark.entity.enums.*;
import com.smartpark.exception.BadRequestException;
import com.smartpark.exception.ConflictException;
import com.smartpark.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ParkingService Unit Tests")
class ParkingServiceTest {

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PricingService pricingService;

    @Mock
    private AuditService auditService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ParkingService parkingService;

    private User user;
    private Vehicle vehicle;
    private ParkingLocation location;
    private ParkingSlot slot;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).fullName("Bob Ross").email("bob@example.com").build();
        vehicle = Vehicle.builder().id(10L).registrationNumber("DL01AB9999").vehicleType(VehicleType.CAR).owner(user).build();
        location = ParkingLocation.builder().id(100L).name("Terminal 1").build();
        slot = ParkingSlot.builder().id(500L).slotNumber("T1-01").status(SlotStatus.AVAILABLE).location(location).build();
    }

    @Test
    @DisplayName("Create parking entry succeeds")
    void testCreateEntrySuccess() {
        ParkingEntryRequest request = new ParkingEntryRequest();
        request.setVehicleId(10L);
        request.setSlotId(500L);

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(slotRepository.findById(500L)).thenReturn(Optional.of(slot));
        when(sessionRepository.findActiveSessionByVehicleId(10L)).thenReturn(Optional.empty());
        when(sessionRepository.findActiveSessionBySlotId(500L)).thenReturn(Optional.empty());
        when(pricingService.getRatePerBlock()).thenReturn(new BigDecimal("50.00"));
        when(sessionRepository.save(any(ParkingSession.class))).thenAnswer(i -> {
            ParkingSession s = i.getArgument(0);
            s.setId(777L);
            return s;
        });

        ParkingSessionResponse response = parkingService.createEntry(request, 1L);

        assertNotNull(response);
        assertEquals("ACTIVE", response.getSessionStatus());
        assertEquals("DL01AB9999", response.getVehicleRegistration());
        assertEquals(SlotStatus.OCCUPIED, slot.getStatus());
        verify(slotRepository, times(1)).save(slot);
    }

    @Test
    @DisplayName("Prevent duplicate active session on same vehicle")
    void testDuplicateActiveVehicleSessionPrevented() {
        ParkingEntryRequest request = new ParkingEntryRequest();
        request.setVehicleId(10L);
        request.setSlotId(500L);

        ParkingSession active = ParkingSession.builder().id(111L).build();

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(slotRepository.findById(500L)).thenReturn(Optional.of(slot));
        when(sessionRepository.findActiveSessionByVehicleId(10L)).thenReturn(Optional.of(active));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                parkingService.createEntry(request, 1L));
        assertTrue(ex.getMessage().contains("Vehicle already has an active"));
    }

    @Test
    @DisplayName("Prevent entry on maintenance slot")
    void testEntryOnMaintenanceSlotPrevented() {
        slot.setStatus(SlotStatus.MAINTENANCE);

        ParkingEntryRequest request = new ParkingEntryRequest();
        request.setVehicleId(10L);
        request.setSlotId(500L);

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(slotRepository.findById(500L)).thenReturn(Optional.of(slot));
        when(sessionRepository.findActiveSessionByVehicleId(10L)).thenReturn(Optional.empty());
        when(sessionRepository.findActiveSessionBySlotId(500L)).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                parkingService.createEntry(request, 1L));
        assertTrue(ex.getMessage().contains("under maintenance"));
    }

    @Test
    @DisplayName("Checkout session calculates fee and releases slot")
    void testCheckoutSession() {
        ParkingSession session = ParkingSession.builder()
                .id(777L)
                .vehicle(vehicle)
                .slot(slot)
                .entryTime(LocalDateTime.now().minusHours(2))
                .sessionStatus(SessionStatus.ACTIVE)
                .build();
        slot.setStatus(SlotStatus.OCCUPIED);

        when(sessionRepository.findByIdWithDetails(777L)).thenReturn(Optional.of(session));
        when(pricingService.calculateFee(any(), any())).thenReturn(new BigDecimal("50.00"));
        when(pricingService.getRatePerBlock()).thenReturn(new BigDecimal("50.00"));

        ParkingSessionResponse response = parkingService.checkout(777L, 1L);

        assertNotNull(response);
        assertEquals("COMPLETED", response.getSessionStatus());
        assertEquals(new BigDecimal("50.00"), session.getTotalBill());
        assertEquals(SlotStatus.AVAILABLE, slot.getStatus());
        verify(slotRepository, times(1)).save(slot);
        verify(sessionRepository, times(1)).save(session);
    }
}
