package com.smartpark.service;

import com.smartpark.entity.AuditLog;
import com.smartpark.entity.Notification;
import com.smartpark.entity.User;
import com.smartpark.entity.enums.NotificationType;
import com.smartpark.repository.AuditLogRepository;
import com.smartpark.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

    public AuditService(AuditLogRepository auditLogRepository, NotificationRepository notificationRepository) {
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void log(User actor, String action, String resourceType, Long resourceId, String metadata) {
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .metadata(metadata)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional
    public void notify(User user, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllNotificationsAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AuditLog> getAuditLogs(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("timestamp").descending());
        return auditLogRepository.findAllWithActor(pageable);
    }
}
