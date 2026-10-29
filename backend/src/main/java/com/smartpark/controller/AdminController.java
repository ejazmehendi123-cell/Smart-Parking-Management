package com.smartpark.controller;

import com.smartpark.dto.response.AuditLogResponse;
import com.smartpark.dto.response.BookingResponse;
import com.smartpark.dto.response.UserResponse;
import com.smartpark.entity.AuditLog;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.security.UserPrincipal;
import com.smartpark.service.AuditService;
import com.smartpark.service.BookingService;
import com.smartpark.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin Operations", description = "User governance, global booking inspection, and audit trails")
public class AdminController {

    private final UserService userService;
    private final BookingService bookingService;
    private final AuditService auditService;

    public AdminController(UserService userService, BookingService bookingService, AuditService auditService) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.auditService = auditService;
    }

    @GetMapping("/users")
    @Operation(summary = "Get list of all registered users (Admin only)")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get specific user details by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Update user account status: ACTIVE, SUSPENDED, DEACTIVATED")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.updateUserStatus(id, body.get("status"), principal.getId()));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Update user role: CUSTOMER, OPERATOR, ADMIN")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.updateUserRole(id, body.get("role"), principal.getId()));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get list of all bookings system-wide (Admin only)")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated system audit logs")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditService.getAuditLogs(page, size);
        Page<AuditLogResponse> response = logs.map(EntityMapper::toAuditLogResponse);
        return ResponseEntity.ok(response);
    }
}
