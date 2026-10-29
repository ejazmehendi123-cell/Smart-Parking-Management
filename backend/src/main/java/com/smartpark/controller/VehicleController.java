package com.smartpark.controller;

import com.smartpark.dto.request.VehicleRequest;
import com.smartpark.dto.response.VehicleResponse;
import com.smartpark.security.UserPrincipal;
import com.smartpark.service.ResourceService;
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
@RequestMapping("/api/vehicles")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Vehicles", description = "Customer vehicle management")
public class VehicleController {

    private final ResourceService resourceService;

    public VehicleController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    @Operation(summary = "Get all vehicles registered to the current user")
    public ResponseEntity<List<VehicleResponse>> getMyVehicles(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(resourceService.getMyVehicles(principal.getId()));
    }

    @PostMapping
    @Operation(summary = "Register a new vehicle")
    public ResponseEntity<VehicleResponse> createVehicle(
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse response = resourceService.createVehicle(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an existing vehicle registration or type")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse response = resourceService.updateVehicle(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a vehicle")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        resourceService.deleteVehicle(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
