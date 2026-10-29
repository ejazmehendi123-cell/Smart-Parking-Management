package com.smartpark.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VehicleRequest {
    @NotBlank(message = "Registration number is required")
    @Pattern(regexp = "^[A-Z0-9 -]{4,20}$", message = "Vehicle registration number must be 4-20 alphanumeric characters (e.g. KA-01-MJ-1234)")
    private String registrationNumber;

    @NotNull(message = "Vehicle type is required")
    private String vehicleType;
}
