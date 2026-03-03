package com.mrsdeores.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.mrsdeores.security.AuthContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mrsdeores.models.ERole;
import com.mrsdeores.models.PasswordResetToken;
import com.mrsdeores.models.Role;
import com.mrsdeores.models.User;
import com.mrsdeores.payload.request.AdminRegisterRequest;
import com.mrsdeores.payload.request.LoginRequest;
import com.mrsdeores.payload.request.SignupRequest;
import com.mrsdeores.payload.response.JwtResponse;
import com.mrsdeores.payload.response.MessageResponse;
import com.mrsdeores.repository.PasswordResetTokenRepository;
import com.mrsdeores.repository.RoleRepository;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.repository.AdminInvitationRepository;
import com.mrsdeores.security.jwt.JwtUtils;
import com.mrsdeores.security.services.UserDetailsImpl;
import com.mrsdeores.services.AdminAuthService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import com.mrsdeores.models.AdminInvitation;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    AdminInvitationRepository adminInvitationRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AdminAuthService adminAuthService;

    @org.springframework.beans.factory.annotation.Value("${app.admin.master-key}")
    private String adminMasterKey;

    @Autowired
    PasswordResetTokenRepository passwordResetTokenRepository;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.from}")
    private String senderEmail;

    private static final ConcurrentHashMap<String, java.time.LocalDateTime> rateLimitCache = new ConcurrentHashMap<>();

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Set AuthContext based on the request (isAdmin flag)
            AuthContext.setAdminAttempt(loginRequest.isAdmin());

            // SECURITY FIX: Prevent Admins from logging in via Normal User portal
            if (!loginRequest.isAdmin()) {
                boolean isAdminIdentity = adminInvitationRepository
                        .findByUsernameOrEmail(loginRequest.getUsername(), loginRequest.getUsername())
                        .isPresent();
                if (isAdminIdentity) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new MessageResponse("Administrators must log in through the Admin Portal."));
                }
            }

            // Proceed with standard authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            // Check if admin session is expired ONLY after successful authentication
            // This prevents username enumeration and incorrect error messages
            if (loginRequest.isAdmin()) {
                if (adminAuthService.isSessionExpired(loginRequest.getUsername())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new MessageResponse(
                                    "Your admin session has expired. Please contact the system owner."));
                }
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            // Update lastLoginAt for regular users (not admins — they're staff, not
            // customers)
            if (!loginRequest.isAdmin()) {
                userRepository.findById(userDetails.getId()).ifPresent(user -> {
                    user.setLastLoginAt(java.time.LocalDateTime.now());
                    userRepository.save(user);
                });
            }

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    roles));
        } finally {
            AuthContext.clear(); // CRITICAL: Clear thread-local after auth
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword()));

        // SECURITY: Always assign ROLE_USER — role is NEVER accepted from request body
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    /**
     * Secure Admin Registration via Invitation Token.
     * 
     * Requirements:
     * - Email must be pre-approved in admin_invitations table
     * - Phone must match the invitation
     * - Invite token must match, not expired, not used
     * - Rate limited: 3 attempts per 15 minutes per IP
     * - All failures return generic "Admin registration not permitted" message
     */
    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(
            @Valid @RequestBody AdminRegisterRequest request,
            HttpServletRequest httpRequest) {
        try {
            String ipAddress = getClientIp(httpRequest);
            adminAuthService.registerAdmin(request, ipAddress);
            return ResponseEntity.ok(new MessageResponse("Admin account created successfully."));
        } catch (AdminAuthService.AdminRegistrationException e) {
            // Rate limit exceeded returns 429
            if (e.getMessage().contains("Too many attempts")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(new MessageResponse(e.getMessage()));
            }
            // All other failures return 403 with generic message
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Bootstrap Admin Invite — Hidden API for System Owner.
     * Authorized via X-Master-Key header mismatching application properties.
     */
    @PostMapping("/admin/bootstrap-invite")
    public ResponseEntity<?> createBootstrapInvite(
            @RequestBody java.util.Map<String, String> body,
            HttpServletRequest request) {

        String providedKey = request.getHeader("X-Master-Key");
        if (providedKey == null || !providedKey.equals(adminMasterKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Unauthorized. Invalid Master Key."));
        }

        String email = body.getOrDefault("email", "").trim();
        String phone = body.getOrDefault("phone", "").trim();

        // Parse session settings
        boolean enableSessionExpiry = Boolean.parseBoolean(body.getOrDefault("enableSessionExpiry", "true"));
        Integer sessionExpiryDays = null;
        if (enableSessionExpiry) {
            try {
                sessionExpiryDays = Integer.parseInt(body.getOrDefault("sessionExpiryDays", "5"));
            } catch (NumberFormatException e) {
                sessionExpiryDays = 5; // fallback
            }
        }

        if (email.isEmpty() || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and phone are required."));
        }

        try {
            String token = adminAuthService.createBootstrapInvite(email, phone, sessionExpiryDays);
            return ResponseEntity.ok(new java.util.HashMap<String, String>() {
                {
                    put("message", "Bootstrap invitation created successfully.");
                    put("inviteToken", token);
                    put("email", email);
                }
            });
        } catch (AdminAuthService.AdminRegistrationException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Invite Admin — Secured endpoint for existing admins to invite team members.
     */
    @PostMapping("/admin/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> inviteAdmin(@RequestBody java.util.Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String phone = body.getOrDefault("phone", "").trim();

        // Parse session settings
        boolean enableSessionExpiry = Boolean.parseBoolean(body.getOrDefault("enableSessionExpiry", "true"));
        Integer sessionExpiryDays = null;
        if (enableSessionExpiry) {
            try {
                sessionExpiryDays = Integer.parseInt(body.getOrDefault("sessionExpiryDays", "5"));
            } catch (NumberFormatException e) {
                sessionExpiryDays = 5; // fallback
            }
        }

        if (email.isEmpty() || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and phone are required."));
        }

        try {
            // Re-use the bootstrap creation logic but logged as a regular invitation
            String token = adminAuthService.createBootstrapInvite(email, phone, sessionExpiryDays);
            return ResponseEntity.ok(new java.util.HashMap<String, String>() {
                {
                    put("message", "Invitation created successfully.");
                    put("inviteToken", token);
                    put("email", email);
                }
            });
        } catch (AdminAuthService.AdminRegistrationException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Forgot Password — Generates a reset token and sends email.
     * Anti-enumeration: always returns 200 regardless of whether email exists.
     */
    @PostMapping("/forgot-password")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> body,
            HttpServletRequest request) {
        String email = body.getOrDefault("email", "").trim();
        String clientIp = getClientIp(request);
        String limitKey = clientIp + ":" + email;

        // Rate limit: 5 minutes between requests
        var lastRequest = rateLimitCache.get(limitKey);
        if (lastRequest != null && lastRequest.isAfter(java.time.LocalDateTime.now().minusMinutes(5))) {
            long remainingSecs = java.time.Duration.between(java.time.LocalDateTime.now().minusMinutes(5), lastRequest)
                    .toSeconds();
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new MessageResponse("Please wait " + (remainingSecs / 60 + 1)
                            + " minutes before requesting another reset link."));
        }

        rateLimitCache.put(limitKey, java.time.LocalDateTime.now());
        logger.info("Password reset requested for email: {}", email);

        try {
            // Priority 1: Check Admins
            var adminOpt = adminInvitationRepository.findByEmailIgnoreCase(email);
            if (adminOpt.isPresent()) {
                AdminInvitation admin = adminOpt.get();
                logger.info("Admin found for password reset: {}", email);

                // Clear old tokens for this admin
                passwordResetTokenRepository.deleteByAdminInvitation(admin);
                passwordResetTokenRepository.flush();

                String token = java.util.UUID.randomUUID().toString();
                passwordResetTokenRepository.save(new PasswordResetToken(token, admin));

                sendHtmlResetEmail(admin.getEmail(), admin.getUsername(), token, true);
            } else {
                // Priority 2: Check standard users
                var userOpt = userRepository.findByEmailIgnoreCase(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    logger.info("User found for password reset: {}", email);

                    passwordResetTokenRepository.deleteByUser(user);
                    passwordResetTokenRepository.flush();

                    String token = java.util.UUID.randomUUID().toString();
                    passwordResetTokenRepository.save(new PasswordResetToken(token, user));

                    sendHtmlResetEmail(user.getEmail(), user.getUsername(), token, false);
                } else {
                    logger.warn("Password reset attempted for non-existent email: {}", email);
                }
            }
        } catch (Exception e) {
            logger.error("Forgot password processing failed for {}: {}", email, e.getMessage(), e);
        }

        return ResponseEntity.ok(new MessageResponse("If this email is registered, a reset link has been sent."));
    }

    private void sendHtmlResetEmail(String toEmail, String username, String token, boolean isAdmin) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);

            String subject = isAdmin ? "[Admin] Reset your Mrs. Deore's password" : "Reset your Mrs. Deore's password";
            helper.setSubject(subject);

            String buttonLabel = isAdmin ? "Secure Admin Reset" : "Secure Reset";

            String htmlContent = String.format(
                    "<!DOCTYPE html>" +
                            "<html><head><style>" +
                            "body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }"
                            +
                            ".wrapper { background-color: #f9fafb; padding: 40px 20px; }" +
                            ".container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; }"
                            +
                            ".header { background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); padding: 40px 20px; text-align: center; color: #ffffff; }"
                            +
                            ".header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }"
                            +
                            ".body { padding: 40px; }" +
                            ".welcome { font-size: 18px; font-weight: 700; color: #111827; margin-top: 0; }" +
                            ".button-container { text-align: center; margin: 35px 0; }" +
                            ".button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); "
                            +
                            "color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.3); transition: all 0.2s; }"
                            +
                            ".fallback { font-size: 13px; color: #6b7280; background-color: #f8fafc; padding: 15px; border-radius: 12px; border: 1px dashed #e2e8f0; word-break: break-all; }"
                            +
                            ".admin-alert { border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 25px 0; }"
                            +
                            ".about-section { background-color: #fffaf0; padding: 25px; margin: 20px -40px -40px -40px; border-top: 1px solid #ffedd5; }"
                            +
                            ".about-title { font-weight: 800; color: #9a3412; font-size: 13px; text-transform: uppercase; margin-bottom: 8px; display: block; }"
                            +
                            ".about-text { font-size: 13px; color: #7c2d12; margin: 0; line-height: 1.5; }" +
                            ".footer { padding: 40px 20px; text-align: center; font-size: 12px; color: #94a3b8; }" +
                            "</style></head>" +
                            "<body><div class='wrapper'><div class='container'>" +
                            "<div class='header'><h1>Mrs. Deore's</h1></div>" +
                            "<div class='body'>" +
                            "<p class='welcome'>Hello %s,</p>" +
                            "<p>We received a secure request to reset your password. To proceed, please click the button below. This link remains active for <strong>15 minutes</strong> for your safety.</p>"
                            +
                            "<div class='button-container'><a href='%s' class='button'>%s</a></div>" +
                            "%s" + // adminNote slot
                            "<p style='margin-bottom: 10px;'>If you're having trouble with the button, copy and paste this link into your browser:</p>"
                            +
                            "<div class='fallback'>%s</div>" +
                            "<p style='margin-top: 25px; font-size: 14px; color: #64748b;'>If you did not request this, you can safely disregard this message. Your password will remain unchanged.</p>"
                            +
                            "<div class='about-section'>" +
                            "<span class='about-title'>About Mrs. Deore's</span>" +
                            "<p class='about-text'>From humble beginnings to your kitchen, Mrs. Deore's is dedicated to simplifying quality baking. We provide premium, authentic premixes that bring professional results to every home baker, anywhere in India.</p>"
                            +
                            "</div>" +
                            "</div></div>" +
                            "<div class='footer'>" +
                            "&copy; 2026 Mrs. Deore's Premix Team<br/>Empowering bakers. Ensuring quality. <br/> " +
                            "Nashik, Maharashtra, India" +
                            "</div></div></body></html>",
                    username, resetLink, buttonLabel, (isAdmin
                            ? "<div class='admin-alert'><p style='color: #ef4444; font-size: 14px; margin: 0;'><strong>Security Isolation:</strong> This is an Administrative reset link. It works strictly for your authorized admin credentials.</p></div>"
                            : ""),
                    resetLink);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("HTML reset email dispatched to {} (isAdmin={})", toEmail, isAdmin);
        } catch (Exception e) {
            logger.error("Failed to send HTML reset email to {}: {}", toEmail, e.getMessage());
            // Fallback to simple mail if HTML fails
            SimpleMailMessage simpleMessage = new SimpleMailMessage();
            simpleMessage.setFrom(senderEmail);
            simpleMessage.setTo(toEmail);
            simpleMessage.setSubject(
                    isAdmin ? "[Admin] Reset your Mrs. Deore's password" : "Reset your Mrs. Deore's password");
            simpleMessage.setText("Hello " + username + ",\n\nReset link: " + resetLink);
            mailSender.send(simpleMessage);
        }
    }

    /**
     * Reset Password — Validates token and updates password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> body) {
        String token = body.getOrDefault("token", "").trim();
        String newPassword = body.getOrDefault("newPassword", "").trim();

        if (token.isEmpty() || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid request. Password must be at least 6 characters."));
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token).orElse(null);
        if (resetToken == null || resetToken.isUsed() || resetToken.isExpired()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("This reset link is invalid or has expired. Please request a new one."));
        }

        if (resetToken.getAdminInvitation() != null) {
            AdminInvitation admin = resetToken.getAdminInvitation();
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminInvitationRepository.save(admin);
            logger.info("Admin password reset successfully for: {}", admin.getEmail());
        } else if (resetToken.getUser() != null) {
            User user = resetToken.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            logger.info("User password reset successfully for: {}", user.getEmail());
        } else {
            logger.error("Token {} has no associated identity!", token);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("An internal error occurred. Please contact support."));
        }

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully! You can now log in."));
    }

    /**
     * Extract client IP, handling proxies.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
