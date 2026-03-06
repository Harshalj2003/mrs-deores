package com.mrsdeores.controllers;

import com.mrsdeores.models.AdminInvitation;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.AdminInvitationRepository;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.security.services.UserDetailsImpl;
import com.mrsdeores.services.EmailVerificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/default-admin")
public class DefaultAdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminInvitationRepository invitationRepository;

    @Autowired
    private EmailVerificationService emailVerificationService;

    // ─── GET /status — Check if default admin exists ───────────────────
    @GetMapping("/status")
    public ResponseEntity<?> getDefaultAdminStatus() {
        User caller = getAuthenticatedUser();
        if (caller == null)
            return unauthorized();

        Optional<User> defaultAdmin = userRepository.findByIsDefaultAdminTrue();
        Map<String, Object> result = new HashMap<>();
        result.put("exists", defaultAdmin.isPresent());
        result.put("isCurrentUserDefault",
                defaultAdmin.isPresent() && defaultAdmin.get().getId().equals(caller.getId()));
        result.put("defaultAdminUsername", defaultAdmin.map(User::getUsername).orElse(null));
        result.put("defaultAdminEmail", defaultAdmin.map(User::getEmail).orElse(null));
        return ResponseEntity.ok(result);
    }

    // ─── POST /request-otp — Send OTP to requesting admin ─────────────
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestClaimOtp() {
        User caller = getAuthenticatedUser();
        if (caller == null)
            return unauthorized();
        if (!isAdmin(caller))
            return forbidden("Only admins can become default admin.");

        // Check if another default admin already exists
        Optional<User> existing = userRepository.findByIsDefaultAdminTrue();
        if (existing.isPresent() && !existing.get().getId().equals(caller.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "A default admin already exists: @" + existing.get().getUsername() + ". They must resign first."));
        }

        emailVerificationService.sendVerificationOTP(caller.getEmail(), caller.getUsername());
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + caller.getEmail()));
    }

    // ─── POST /claim — Verify OTP and become default admin ────────────
    @PostMapping("/claim")
    public ResponseEntity<?> claimDefaultAdmin(@RequestBody Map<String, String> body) {
        User caller = getAuthenticatedUser();
        if (caller == null)
            return unauthorized();
        if (!isAdmin(caller))
            return forbidden("Only admins can become default admin.");

        String otp = body.get("otp");
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP is required."));
        }

        // Check no other default admin exists
        Optional<User> existing = userRepository.findByIsDefaultAdminTrue();
        if (existing.isPresent() && !existing.get().getId().equals(caller.getId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Another admin already holds the default position."));
        }

        boolean valid = emailVerificationService.verifyOTP(caller.getEmail(), otp);
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP."));
        }

        // Re-verify email after OTP check (verifyOTP sets isEmailVerified=true)
        caller.setIsEmailVerified(true);
        caller.setIsDefaultAdmin(true);
        userRepository.save(caller);

        return ResponseEntity.ok(Map.of("message", "You are now the Default Admin."));
    }

    // ─── POST /resign-otp — Send OTP to resign from default admin ─────
    @PostMapping("/resign-otp")
    public ResponseEntity<?> requestResignOtp() {
        User caller = getAuthenticatedUser();
        if (caller == null)
            return unauthorized();
        if (!Boolean.TRUE.equals(caller.getIsDefaultAdmin())) {
            return forbidden("You are not the default admin.");
        }

        emailVerificationService.sendVerificationOTP(caller.getEmail(), caller.getUsername());
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + caller.getEmail()));
    }

    // ─── POST /resign — Verify OTP and resign from default admin ──────
    @PostMapping("/resign")
    public ResponseEntity<?> resignDefaultAdmin(@RequestBody Map<String, String> body) {
        User caller = getAuthenticatedUser();
        if (caller == null)
            return unauthorized();
        if (!Boolean.TRUE.equals(caller.getIsDefaultAdmin())) {
            return forbidden("You are not the default admin.");
        }

        String otp = body.get("otp");
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP is required."));
        }

        boolean valid = emailVerificationService.verifyOTP(caller.getEmail(), otp);
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP."));
        }

        caller.setIsDefaultAdmin(false);
        userRepository.save(caller);

        return ResponseEntity.ok(Map.of("message", "You have resigned as Default Admin. The position is now open."));
    }

    // ─── DELETE /invitations/{id} — Delete invitation + enrolled admin ─
    @DeleteMapping("/invitations/{id}")
    public ResponseEntity<?> deleteInvitation(@PathVariable Long id) {
        User caller = getAuthenticatedUser();
        if (caller == null)
            return unauthorized();
        if (!Boolean.TRUE.equals(caller.getIsDefaultAdmin())) {
            return forbidden("Only the default admin can delete invitations.");
        }

        Optional<AdminInvitation> invOpt = invitationRepository.findById(id);
        if (invOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invitation not found."));
        }

        AdminInvitation inv = invOpt.get();

        // If the invited admin was enrolled, also delete their user account
        if (inv.getIsFullyEnrolled() && inv.getUsername() != null) {
            Optional<User> enrolledUser = userRepository.findByUsername(inv.getUsername());
            if (enrolledUser.isPresent()) {
                User target = enrolledUser.get();
                // Prevent deleting yourself or another default admin
                if (target.getId().equals(caller.getId())) {
                    return ResponseEntity.badRequest().body(Map.of("message", "You cannot delete yourself."));
                }
                if (Boolean.TRUE.equals(target.getIsDefaultAdmin())) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete another default admin."));
                }
                userRepository.delete(target);
            }
        }

        // Delete the invitation record
        invitationRepository.delete(inv);

        return ResponseEntity.ok(Map.of("message", "Invitation and associated admin account deleted successfully."));
    }

    // ─── Helpers ──────────────────────────────────────────────────────
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) principal).getId();
            return userRepository.findById(userId).orElse(null);
        }
        return null;
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
    }

    private ResponseEntity<?> forbidden(String msg) {
        return ResponseEntity.status(403).body(Map.of("message", msg));
    }
}
