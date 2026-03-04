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

    @Autowired
    private AdminInvitationRepository invitationRepository;

    @Autowired
    private AdminAuthAttemptRepository attemptRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RateLimitConfigService rateLimitConfig;

    @Value("${app.admin.secret-key:}")
    private String adminSecretKey;

    @Value("${app.admin.master-key}")
    private String adminMasterKey;

    /**
     * Register a new admin account using invitation token.
     * 
     * Security rules:
     * 1. Rate limit: configurable attempts per configurable window (default
     * 3/15min)
     * 2. All failures return the same generic message
     * 3. Role is assigned server-side, never from request
     * 4. Invitation is marked as used after success
     * 5. All attempts are logged for audit
     */
    @Transactional
    public void registerAdmin(AdminRegisterRequest request, String ipAddress) {
        // 1. Rate limiting check (reads from admin-configurable settings)
        int maxAttempts = rateLimitConfig.getAdminRegMaxAttempts();
        int windowMinutes = rateLimitConfig.getAdminRegWindowMinutes();

        long recentAttempts = attemptRepository.countByIpAddressAndAttemptedAtAfter(
                ipAddress, LocalDateTime.now().minusMinutes(windowMinutes));

        if (recentAttempts >= maxAttempts) {
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

        invitationRepository.save(invitation);

        // 7. Log successful attempt
        logAttempt(request.getEmail(), ipAddress, true);
        logger.info("ADMIN ENROLLED: {} (email: {}) from IP: {}", request.getUsername(), request.getEmail(), ipAddress);
    }

    /**
     * Creates a bootstrap admin invitation using the master key or by another
     * admin.
     * Optionally configures how long the session will last upon enrollment.
     */
    @Transactional
    public String createBootstrapInvite(String email, String phone, Integer sessionExpiryDays) {
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

        // Handle session expiry customization
        if (sessionExpiryDays != null && sessionExpiryDays > 0) {
            invitation.setSessionExpiresAt(LocalDateTime.now().plusDays(sessionExpiryDays));
        } else {
            invitation.setSessionExpiresAt(null); // Explicitly no expiry (or handled by DB default)
        }

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

    /**
     * Updates the session expiry for an existing admin invitation.
     */
    @Transactional
    public void updateInvitationSession(Long id, Integer sessionExpiryDays) {
        AdminInvitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invitation not found."));

        if (sessionExpiryDays != null && sessionExpiryDays > 0) {
            invitation.setSessionExpiresAt(LocalDateTime.now().plusDays(sessionExpiryDays));
        } else {
            invitation.setSessionExpiresAt(null);
        }

        invitationRepository.save(invitation);
        logger.info("ADMIN SESSION UPDATED: Invitation ID {} updated by system owner.", id);
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
