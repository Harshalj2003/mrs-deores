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
import com.mrsdeores.security.jwt.JwtUtils;
import com.mrsdeores.security.services.UserDetailsImpl;
import com.mrsdeores.services.AdminAuthService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

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

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String senderEmail;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Set AuthContext based on the request (isAdmin flag)
            AuthContext.setAdminAttempt(loginRequest.isAdmin());

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

        if (email.isEmpty() || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and phone are required."));
        }

        try {
            String token = adminAuthService.createBootstrapInvite(email, phone);
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

        if (email.isEmpty() || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and phone are required."));
        }

        try {
            // Re-use the bootstrap creation logic but logged as a regular invitation
            String token = adminAuthService.createBootstrapInvite(email, phone);
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
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        logger.info("Password reset requested for email: {}", email);
        try {
            userRepository.findByEmail(email).ifPresentOrElse(user -> {
                logger.info("User found for email: {}. Proceeding to send email.", email);
                // Remove old tokens for this user
                passwordResetTokenRepository.deleteByUser(user);
                // Generate new token
                String token = java.util.UUID.randomUUID().toString();
                PasswordResetToken resetToken = new PasswordResetToken(token, user);
                passwordResetTokenRepository.save(resetToken);
                // Send email
                String resetLink = frontendUrl + "/reset-password?token=" + token;
                logger.info("Sending reset email from: {} to: {}", senderEmail, user.getEmail());

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(senderEmail);
                message.setTo(user.getEmail());
                message.setSubject("Reset your Mrs. Deore's password");
                message.setText(
                        "Hello " + user.getUsername() + ",\n\n" +
                                "You requested to reset your password. Click the link below (valid for 15 minutes):\n\n"
                                +
                                resetLink + "\n\n" +
                                "If you did not request this, please ignore this email.\n\n" +
                                "— Mrs. Deore's Premix Team");

                mailSender.send(message);
                logger.info("Successfully sent reset email to: {}", user.getEmail());
            }, () -> {
                logger.warn("Password reset attempted for non-existent email: {}", email);
            });
        } catch (Exception e) {
            // Log but don't expose error to client
            logger.error("Forgot password error for email {}: ", email, e);
        }
        return ResponseEntity.ok(new MessageResponse("If this email is registered, a reset link has been sent."));
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

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
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
