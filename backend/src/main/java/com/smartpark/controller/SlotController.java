package com.smartpark.controller;

import com.smartpark.dto.request.SlotRequest;
import com.smartpark.dto.response.SlotResponse;
import com.smartpark.security.UserPrincipal;
import com.smartpark.service.ResourceService;
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
@RequestMapping("/api/slots")
@Tag(name = "Slots", description = "Parking slot management and availability")
public class SlotController {

    private final ResourceService resourceService;

    public SlotController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    @Operation(summary = "Get slots filtered by location, type, or status")
    public ResponseEntity<List<SlotResponse>> getAllSlots(
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(resourceService.getAllSlots(locationId, type, status));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available parking slots")
    public ResponseEntity<List<SlotResponse>> getAvailableSlots(
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(resourceService.getAvailableSlots(locationId, type));
    }

    @GetMapping("/occupied")
    @Operation(summary = "Get currently occupied parking slots (Active Records)")
    public ResponseEntity<List<SlotResponse>> getOccupiedSlots(
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(resourceService.getOccupiedSlots(locationId, type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single parking slot by ID")
    public ResponseEntity<SlotResponse> getSlot(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getSlot(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a new parking slot (Admin only)")
    public ResponseEntity<SlotResponse> createSlot(
            @Valid @RequestBody SlotRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SlotResponse response = resourceService.createSlot(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update parking slot details or status (Admin/Operator)")
    public ResponseEntity<SlotResponse> updateSlot(
            @PathVariable Long id,
            @RequestBody SlotRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SlotResponse response = resourceService.updateSlot(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }
}
