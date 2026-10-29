package com.smartpark.service;

import com.smartpark.dto.request.LoginRequest;
import com.smartpark.dto.request.RegisterRequest;
import com.smartpark.dto.response.AuthResponse;
import com.smartpark.dto.response.UserResponse;
import com.smartpark.entity.User;
import com.smartpark.entity.enums.AccountStatus;
import com.smartpark.entity.enums.NotificationType;
import com.smartpark.entity.enums.UserRole;
import com.smartpark.exception.ConflictException;
import com.smartpark.mapper.EntityMapper;
import com.smartpark.repository.UserRepository;
import com.smartpark.security.JwtTokenProvider;
import com.smartpark.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider, AuthenticationManager authenticationManager,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        auditService.log(user, "USER_REGISTERED", "USER", user.getId(), null);
        auditService.notify(user, "Welcome to SmartPark! Your account has been created successfully.", NotificationType.GENERAL);

        UserPrincipal principal = new UserPrincipal(user);
        String token = tokenProvider.generateToken(principal);

        return AuthResponse.of(token, EntityMapper.toUserResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        User user = userRepository.findByEmail(principal.getEmail()).orElseThrow();
        return AuthResponse.of(token, EntityMapper.toUserResponse(user));
    }

    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        return EntityMapper.toUserResponse(user);
    }
}
