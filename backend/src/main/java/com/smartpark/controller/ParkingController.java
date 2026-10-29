package com.smartpark.controller;

import com.smartpark.dto.request.ParkingEntryRequest;
import com.smartpark.dto.request.QrVerifyRequest;
import com.smartpark.dto.response.FeeEstimateResponse;
import com.smartpark.dto.response.ParkingSessionResponse;
import com.smartpark.security.UserPrincipal;
import com.smartpark.service.ParkingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Parking Operations", description = "Vehicle entry, QR check-in, real-time fee estimation, and checkout")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping("/entry")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Manual or walk-in vehicle parking entry (Admin/Operator)")
    public ResponseEntity<ParkingSessionResponse> createEntry(
            @Valid @RequestBody ParkingEntryRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ParkingSessionResponse response = parkingService.createEntry(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-qr")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Verify booking QR code at gate to initiate parking session (Admin/Operator)")
    public ResponseEntity<ParkingSessionResponse> verifyQrAndEntry(
            @Valid @RequestBody QrVerifyRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ParkingSessionResponse response = parkingService.verifyQrAndEntry(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "List all currently active parking sessions (Admin/Operator)")
    public ResponseEntity<List<ParkingSessionResponse>> getActiveSessions() {
        return ResponseEntity.ok(parkingService.getActiveSessions());
    }

    @GetMapping("/my-sessions")
    @Operation(summary = "Get current user's parking session history")
    public ResponseEntity<List<ParkingSessionResponse>> getMySessions(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(parkingService.getMySessions(principal.getId()));
    }

    @GetMapping("/{id}/estimate")
    @Operation(summary = "Get real-time accumulated parking fee estimate for an active session")
    public ResponseEntity<FeeEstimateResponse> getEstimate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = "ADMIN".equals(principal.getRole()) || "OPERATOR".equals(principal.getRole());
        return ResponseEntity.ok(parkingService.getEstimate(id, principal.getId(), isAdmin));
    }

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Complete parking session and calculate final bill (Admin/Operator)")
    public ResponseEntity<ParkingSessionResponse> checkout(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(parkingService.checkout(id, principal.getId()));
    }
}
