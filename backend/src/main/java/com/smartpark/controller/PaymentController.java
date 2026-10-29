package com.smartpark.controller;

import com.smartpark.dto.request.PaymentRequest;
import com.smartpark.dto.response.PaymentResponse;
import com.smartpark.security.UserPrincipal;
import com.smartpark.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Payments & Billing", description = "Payment settlement and receipt retrieval")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Process simulated payment for a completed parking session (Demo Mode)")
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = "ADMIN".equals(principal.getRole());
        PaymentResponse response = paymentService.processPayment(request, principal.getId(), isAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get receipt details by payment ID")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = "ADMIN".equals(principal.getRole());
        return ResponseEntity.ok(paymentService.getPayment(id, principal.getId(), isAdmin));
    }

    @GetMapping("/my-payments")
    @Operation(summary = "Get payment history for the logged in user")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getMyPayments(principal.getId()));
    }
}
