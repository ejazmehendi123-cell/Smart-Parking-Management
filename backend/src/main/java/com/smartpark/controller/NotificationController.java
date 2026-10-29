package com.smartpark.controller;

import com.smartpark.dto.response.NotificationResponse;
import com.smartpark.entity.Notification;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.security.UserPrincipal;
import com.smartpark.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Notifications", description = "User alerts and notification feed")
public class NotificationController {

    private final AuditService auditService;

    public NotificationController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for the current authenticated user")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Notification> notifications = auditService.getUserNotifications(principal.getId());
        List<NotificationResponse> response = notifications.stream()
                .map(EntityMapper::toNotificationResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        auditService.markNotificationAsRead(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        auditService.markAllNotificationsAsRead(principal.getId());
        return ResponseEntity.noContent().build();
    }
}
