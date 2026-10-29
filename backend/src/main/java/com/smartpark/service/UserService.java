package com.smartpark.service;

import com.smartpark.dto.response.UserResponse;
import com.smartpark.entity.User;
import com.smartpark.entity.enums.AccountStatus;
import com.smartpark.entity.enums.UserRole;
import com.smartpark.exception.BadRequestException;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(EntityMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return EntityMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, String status, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        try {
            AccountStatus newStatus = AccountStatus.valueOf(status.toUpperCase());
            user.setAccountStatus(newStatus);
            user = userRepository.save(user);

            User admin = userRepository.findById(adminId).orElse(null);
            auditService.log(admin, "USER_STATUS_UPDATED", "USER", user.getId(), "status=" + newStatus);

            return EntityMapper.toUserResponse(user);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String role, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        try {
            UserRole newRole = UserRole.valueOf(role.toUpperCase());
            user.setRole(newRole);
            user = userRepository.save(user);

            User admin = userRepository.findById(adminId).orElse(null);
            auditService.log(admin, "USER_ROLE_UPDATED", "USER", user.getId(), "role=" + newRole);

            return EntityMapper.toUserResponse(user);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + role);
        }
    }
}
