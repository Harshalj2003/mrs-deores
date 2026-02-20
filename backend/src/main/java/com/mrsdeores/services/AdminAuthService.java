package com.mrsdeores.services;

import com.mrsdeores.models.*;
import com.mrsdeores.payload.request.AdminRegisterRequest;
import com.mrsdeores.repository.AdminAuthAttemptRepository;
import com.mrsdeores.repository.AdminInvitationRepository;
import com.mrsdeores.repository.RoleRepository;
import com.mrsdeores.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class AdminAuthService {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthService.class);

    private static final int MAX_ATTEMPTS = 3;
    private static final int RATE_LIMIT_MINUTES = 15;

    @Autowired
    private AdminInvitationRepository invitationRepository;

    @Autowired
    private AdminAuthAttemptRepository attemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.secret-key:}")
    private String adminSecretKey;

    /**
     * Register a new admin account using invitation token.
     * 
     * Security rules:
     * 1. Rate limit: max 3 attempts per IP in 15 minutes
     * 2. All failures return the same generic message
     * 3. Role is assigned server-side, never from request
     * 4. Invitation is marked as used after success
     * 5. All attempts are logged for audit
     */
    @Transactional
    public void registerAdmin(AdminRegisterRequest request, String ipAddress) {
        // 1. Rate limiting check
        long recentAttempts = attemptRepository.countByIpAddressAndAttemptedAtAfter(
                ipAddress, LocalDateTime.now().minusMinutes(RATE_LIMIT_MINUTES));

        if (recentAttempts >= MAX_ATTEMPTS) {
            logger.warn("SECURITY: Rate limit exceeded for admin registration from IP: {}", ipAddress);
            throw new AdminRegistrationException("Too many attempts. Please try again later.");
        }

        // 2. Check if username or email already taken
        if (userRepository.existsByUsername(request.getUsername())) {
            logAttempt(request.getEmail(), ipAddress, false);
            throw new AdminRegistrationException("Admin registration not permitted.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            logAttempt(request.getEmail(), ipAddress, false);
            throw new AdminRegistrationException("Admin registration not permitted.");
        }

        // 3. Find and validate invitation (email + phone + token must ALL match)
        AdminInvitation invitation = invitationRepository
                .findByEmailAndPhoneAndInviteToken(
                        request.getEmail(),
                        request.getPhone(),
                        request.getInviteToken())
                .orElse(null);

        if (invitation == null) {
            logAttempt(request.getEmail(), ipAddress, false);
            logger.warn("SECURITY: Invalid admin registration attempt - email: {}, IP: {}", request.getEmail(),
                    ipAddress);
            throw new AdminRegistrationException("Admin registration not permitted.");
        }

        // 4. Check if invitation is expired or used
        if (invitation.getUsed() || invitation.isExpired()) {
            logAttempt(request.getEmail(), ipAddress, false);
            logger.warn("SECURITY: Expired/used invitation attempt - email: {}, IP: {}", request.getEmail(), ipAddress);
            throw new AdminRegistrationException("Admin registration not permitted.");
        }

        // 5. Create admin user (role assigned SERVER-SIDE only)
        User admin = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()));

        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin role not found."));
        roles.add(adminRole);
        admin.setRoles(roles);

        userRepository.save(admin);

        // 6. Mark invitation as used
        invitation.setUsed(true);
        invitationRepository.save(invitation);

        // 7. Log successful attempt
        logAttempt(request.getEmail(), ipAddress, true);
        logger.info("ADMIN CREATED: {} (email: {}) from IP: {}", request.getUsername(), request.getEmail(), ipAddress);
    }

    private void logAttempt(String email, String ipAddress, boolean success) {
        AdminAuthAttempt attempt = new AdminAuthAttempt(email, ipAddress, success);
        attemptRepository.save(attempt);
    }

    /**
     * Custom exception for admin registration failures.
     * Always uses a generic message to prevent information leakage.
     */
    public static class AdminRegistrationException extends RuntimeException {
        public AdminRegistrationException(String message) {
            super(message);
        }
    }
}
