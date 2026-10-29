package com.smartpark.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "Payment method is required")
    private String method;
}
