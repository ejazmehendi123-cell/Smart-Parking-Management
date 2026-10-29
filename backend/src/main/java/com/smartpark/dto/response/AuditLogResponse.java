package com.smartpark.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String actorName;
    private String actorEmail;
    private String action;
    private String resourceType;
    private Long resourceId;
    private String metadata;
    private LocalDateTime timestamp;
}
