package com.smartpark.controller;

import com.smartpark.dto.request.LocationRequest;
import com.smartpark.dto.response.LocationResponse;
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
@RequestMapping("/api/locations")
@Tag(name = "Locations", description = "Parking location management")
public class LocationController {

    private final ResourceService resourceService;

    public LocationController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    @Operation(summary = "Get all parking locations with slot counts")
    public ResponseEntity<List<LocationResponse>> getAllLocations() {
        return ResponseEntity.ok(resourceService.getAllLocations());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a new parking location (Admin only)")
    public ResponseEntity<LocationResponse> createLocation(
            @Valid @RequestBody LocationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LocationResponse response = resourceService.createLocation(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update a parking location (Admin only)")
    public ResponseEntity<LocationResponse> updateLocation(
            @PathVariable Long id,
            @RequestBody LocationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LocationResponse response = resourceService.updateLocation(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }
}
