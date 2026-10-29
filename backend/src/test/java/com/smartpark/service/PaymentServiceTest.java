package com.smartpark.service;

import com.smartpark.dto.request.PaymentRequest;
import com.smartpark.dto.response.PaymentResponse;
import com.smartpark.entity.*;
import com.smartpark.entity.enums.*;
import com.smartpark.exception.BadRequestException;
import com.smartpark.exception.ConflictException;
import com.smartpark.exception.UnauthorizedException;
import com.smartpark.repository.ParkingSessionRepository;
import com.smartpark.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Unit Tests")
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PaymentService paymentService;

    private User owner;
    private Vehicle vehicle;
    private ParkingLocation location;
    private ParkingSlot slot;
    private ParkingSession session;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).fullName("John Doe").email("john@example.com").build();
        vehicle = Vehicle.builder().id(10L).registrationNumber("MH12AB1234").vehicleType(VehicleType.CAR).owner(owner).build();
        location = ParkingLocation.builder().id(100L).name("Downtown Plaza").build();
        slot = ParkingSlot.builder().id(1000L).slotNumber("A-101").location(location).build();
        session = ParkingSession.builder()
                .id(500L)
                .vehicle(vehicle)
                .slot(slot)
                .entryTime(LocalDateTime.now().minusHours(2))
                .exitTime(LocalDateTime.now())
                .totalBill(new BigDecimal("50.00"))
                .sessionStatus(SessionStatus.COMPLETED)
                .build();
    }

    @Test
    @DisplayName("Successfully process payment for completed session")
    void testProcessPaymentSuccess() {
        PaymentRequest request = new PaymentRequest();
        request.setSessionId(500L);
        request.setMethod("UPI");

        when(sessionRepository.findByIdWithDetails(500L)).thenReturn(Optional.of(session));
        when(paymentRepository.findBySessionId(500L)).thenReturn(Collections.emptyList());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(999L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(request, 1L, false);

        assertNotNull(response);
        assertEquals(new BigDecimal("50.00"), response.getAmount());
        assertEquals("PAID", response.getStatus());
        assertEquals("UPI", response.getMethod());
        assertTrue(response.getTransactionReference().startsWith("TXN-"));

        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Fails if session is not completed")
    void testFailIfNotCompleted() {
        session.setSessionStatus(SessionStatus.ACTIVE);

        PaymentRequest request = new PaymentRequest();
        request.setSessionId(500L);
        request.setMethod("CASH");

        when(sessionRepository.findByIdWithDetails(500L)).thenReturn(Optional.of(session));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                paymentService.processPayment(request, 1L, false));
        assertTrue(ex.getMessage().contains("must be completed before payment"));
    }

    @Test
    @DisplayName("Fails if payment was already made (duplicate payment prevention)")
    void testDuplicatePaymentPrevention() {
        Payment paidPayment = Payment.builder().id(1L).status(PaymentStatus.PAID).build();

        PaymentRequest request = new PaymentRequest();
        request.setSessionId(500L);
        request.setMethod("CARD");

        when(sessionRepository.findByIdWithDetails(500L)).thenReturn(Optional.of(session));
        when(paymentRepository.findBySessionId(500L)).thenReturn(List.of(paidPayment));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                paymentService.processPayment(request, 1L, false));
        assertTrue(ex.getMessage().contains("already completed"));
    }

    @Test
    @DisplayName("Fails if non-admin user attempts to pay for someone else's session")
    void testUnauthorizedPaymentAttempt() {
        PaymentRequest request = new PaymentRequest();
        request.setSessionId(500L);
        request.setMethod("WALLET");

        when(sessionRepository.findByIdWithDetails(500L)).thenReturn(Optional.of(session));
        when(paymentRepository.findBySessionId(500L)).thenReturn(Collections.emptyList());

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                paymentService.processPayment(request, 99L, false)); // user 99 is not owner
        assertTrue(ex.getMessage().contains("only pay for your own sessions"));
    }
}
