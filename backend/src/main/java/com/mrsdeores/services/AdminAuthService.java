package com.mrsdeores.services;

import com.mrsdeores.models.*;
import com.mrsdeores.payload.request.AdminRegisterRequest;
import com.mrsdeores.repository.AdminAuthAttemptRepository;
import com.mrsdeores.repository.AdminInvitationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

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
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.secret-key:}")
    private String adminSecretKey;

    @Value("${app.admin.master-key}")
    private String adminMasterKey;

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

        // 2. Check if username or email already taken in ADMIN registry
        if (invitationRepository.findByUsername(request.getUsername()).isPresent()) {
            logAttempt(request.getEmail(), ipAddress, false);
            throw new AdminRegistrationException("Admin registration not permitted.");
        }

        if (invitationRepository.findByEmail(request.getEmail()).isPresent()) {
            AdminInvitation inv = invitationRepository.findByEmail(request.getEmail()).get();
            if (inv.getIsFullyEnrolled()) {
                logAttempt(request.getEmail(), ipAddress, false);
                throw new AdminRegistrationException("Admin registration not permitted.");
            }
        }

        // 3. Find and validate invitation (email + phone + token must ALL match)
        AdminInvitation invitation = invitationRepository
                .findByEmailAndPhoneAndInviteToken(
                        request.getEmail(),
                        request.getPhone(),
                        request.getInviteToken())
                .orElse(null);

        if (invitation == null || invitation.isExpired()) {
            logAttempt(request.getEmail(), ipAddress, false);
            logger.warn("SECURITY: Invalid/Expired admin invitation - email: {}, IP: {}", request.getEmail(),
                    ipAddress);
            throw new AdminRegistrationException("Admin registration not permitted.");
        }

        // 5. Enroll admin (Isolated from users table)
        invitation.setUsername(request.getUsername());
        invitation.setPassword(passwordEncoder.encode(request.getPassword()));
        invitation.setIsFullyEnrolled(true);
        invitation.setUsed(true);
        invitation.setSessionExpiresAt(LocalDateTime.now().plusDays(5)); // Default 5 days session

        invitationRepository.save(invitation);

        // 7. Log successful attempt
        logAttempt(request.getEmail(), ipAddress, true);
        logger.info("ADMIN ENROLLED: {} (email: {}) from IP: {}", request.getUsername(), request.getEmail(), ipAddress);
    }

    /**
     * Creates a bootstrap admin invitation using the master key.
     * This bypassing the normal flow and is used by the system owner.
     */
    @Transactional
    public String createBootstrapInvite(String email, String phone) {
        // Prevent duplicate emails
        if (invitationRepository.findByEmail(email).isPresent()) {
            throw new AdminRegistrationException("An invitation or admin already exists for this email.");
        }

        AdminInvitation invitation = new AdminInvitation();
        invitation.setEmail(email);
        invitation.setPhone(phone);

        // Generate a secure token
        String token = UUID.randomUUID().toString().replace("-", "") + "-"
                + UUID.randomUUID().toString().substring(0, 8);
        invitation.setInviteToken(token);

        invitation.setUsed(false);
        invitation.setIsFullyEnrolled(false);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(24)); // Invite valid for 24 hours
        invitation.setSessionExpiresAt(LocalDateTime.now().plusHours(24));

        invitationRepository.save(invitation);

        logger.info("BOOTSTRAP INVITE CREATED: for email {} with phone {}", email, phone);
        return token;
    }

    /**
     * Validates if the admin needs to re-enter their invitation token due to
     * expiry.
     */
    public boolean isSessionExpired(String identifier) {
        return invitationRepository.findByUsernameOrEmail(identifier, identifier)
                .map(AdminInvitation::isSessionExpired)
                .orElse(true);
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
