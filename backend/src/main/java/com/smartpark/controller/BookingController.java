package com.smartpark.controller;

import com.smartpark.dto.request.BookingRequest;
import com.smartpark.dto.response.BookingResponse;
import com.smartpark.security.UserPrincipal;
import com.smartpark.service.BookingService;
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
@RequestMapping("/api/bookings")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Bookings", description = "Parking slot reservation workflows")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a new parking reservation")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingResponse response = bookingService.createBooking(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get current user's bookings with optional status filter")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getId(), status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details by ID")
    public ResponseEntity<BookingResponse> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = "ADMIN".equals(principal.getRole());
        return ResponseEntity.ok(bookingService.getBooking(id, principal.getId(), isAdmin));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an existing confirmed booking")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = "ADMIN".equals(principal.getRole());
        return ResponseEntity.ok(bookingService.cancelBooking(id, principal.getId(), isAdmin));
    }

    @GetMapping("/{id}/ticket")
    @Operation(summary = "Get digital ticket with QR token for a booking")
    public ResponseEntity<BookingResponse> getBookingTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getBookingTicket(id, principal.getId()));
    }
}
