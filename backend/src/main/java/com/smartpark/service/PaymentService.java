package com.smartpark.service;

import com.smartpark.dto.request.PaymentRequest;
import com.smartpark.dto.response.PaymentResponse;
import com.smartpark.entity.*;
import com.smartpark.entity.enums.*;
import com.smartpark.exception.*;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository sessionRepository;
    private final AuditService auditService;

    public PaymentService(PaymentRepository paymentRepository, ParkingSessionRepository sessionRepository,
                          AuditService auditService) {
        this.paymentRepository = paymentRepository;
        this.sessionRepository = sessionRepository;
        this.auditService = auditService;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, Long userId, boolean isAdmin) {
        ParkingSession session = sessionRepository.findByIdWithDetails(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking Session", request.getSessionId()));

        if (session.getSessionStatus() != SessionStatus.COMPLETED) {
            throw new BadRequestException("Session must be completed before payment. Current: " + session.getSessionStatus());
        }

        // Check for existing successful payment
        List<Payment> existingPayments = paymentRepository.findBySessionId(session.getId());
        boolean hasPaid = existingPayments.stream().anyMatch(p -> p.getStatus() == PaymentStatus.PAID);
        if (hasPaid) {
            throw new ConflictException("Payment already completed for this session");
        }

        // Ownership check for non-admin users
        if (!isAdmin && !session.getVehicle().getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only pay for your own sessions");
        }

        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.getMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + request.getMethod());
        }

        String txRef = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Payment payment = Payment.builder()
                .session(session)
                .amount(session.getTotalBill())
                .method(method)
                .status(PaymentStatus.PAID)  // Simulated: DEMO MODE — auto-success
                .transactionReference(txRef)
                .paymentTimestamp(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);

        auditService.log(null, "PAYMENT_PROCESSED", "PAYMENT", payment.getId(),
                "amount=" + session.getTotalBill() + ",method=" + method + ",txRef=" + txRef);
        auditService.notify(session.getVehicle().getOwner(),
                "Payment of ₹" + session.getTotalBill() + " received. Transaction: " + txRef +
                " [DEMO MODE — No real money transferred]", NotificationType.PAYMENT_SUCCESS);

        log.info("Payment processed: session={} amount={} txRef={}", session.getId(), session.getTotalBill(), txRef);

        return EntityMapper.toPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(Long paymentId, Long userId, boolean isAdmin) {
        Payment payment = paymentRepository.findByIdWithDetails(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (!isAdmin && !payment.getSession().getVehicle().getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You can only view your own payments");
        }

        return EntityMapper.toPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments(Long userId) {
        return paymentRepository.findByUserIdWithDetails(userId).stream()
                .map(EntityMapper::toPaymentResponse).collect(Collectors.toList());
    }
}
