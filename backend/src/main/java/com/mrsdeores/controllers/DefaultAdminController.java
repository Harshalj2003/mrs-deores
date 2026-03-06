package com.mrsdeores.controllers;

import com.mrsdeores.models.AdminInvitation;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.AdminInvitationRepository;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.security.services.UserDetailsImpl;
import com.mrsdeores.services.EmailVerificationService;
import com.mrsdeores.services.EmailService;

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

    @Autowired
    private EmailService emailService;

    // ─── GET /status — Check if default admin exists ───────────────────
    @GetMapping("/status")
    public ResponseEntity<?> getDefaultAdminStatus() {
        AdminInvitation caller = getAuthenticatedAdmin();
        if (caller == null)
            return unauthorized();

        Optional<AdminInvitation> defaultAdmin = invitationRepository.findByIsDefaultAdminTrue();
        Map<String, Object> result = new HashMap<>();
        result.put("exists", defaultAdmin.isPresent());
        result.put("isCurrentUserDefault",
                defaultAdmin.isPresent() && defaultAdmin.get().getId().equals(caller.getId()));
        result.put("defaultAdminUsername", defaultAdmin.map(AdminInvitation::getUsername).orElse(null));
        result.put("defaultAdminEmail", defaultAdmin.map(AdminInvitation::getEmail).orElse(null));
        result.put("currentAdminEmail", caller.getEmail());
        return ResponseEntity.ok(result);
    }

    // ─── POST /request-otp — Send OTP to requesting admin ─────────────
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestClaimOtp() {
        AdminInvitation caller = getAuthenticatedAdmin();
        if (caller == null)
            return unauthorized();

        // Check if another default admin already exists
        Optional<AdminInvitation> existing = invitationRepository.findByIsDefaultAdminTrue();
        if (existing.isPresent() && !existing.get().getId().equals(caller.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "A default admin already exists: @" + existing.get().getUsername() + ". They must resign first."));
        }

        // Generate and send OTP using the existing service
        emailVerificationService.sendVerificationOTP(caller.getEmail(), caller.getUsername());
        // Then send the custom default-admin HTML email with the same OTP
        // The OTP is already stored in DB by the service, we just also send a branded
        // email
        emailService.sendDefaultAdminOtpEmail(caller.getEmail(), caller.getUsername(), "claim");

        return ResponseEntity.ok(Map.of("message", "OTP sent to " + caller.getEmail()));
    }

    // ─── POST /claim — Verify OTP and become default admin ────────────
    @PostMapping("/claim")
    public ResponseEntity<?> claimDefaultAdmin(@RequestBody Map<String, String> body) {
        AdminInvitation caller = getAuthenticatedAdmin();
        if (caller == null)
            return unauthorized();

        String otp = body.get("otp");
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP is required."));
        }

        // Check no other default admin exists
        Optional<AdminInvitation> existing = invitationRepository.findByIsDefaultAdminTrue();
        if (existing.isPresent() && !existing.get().getId().equals(caller.getId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Another admin already holds the default position."));
        }

        boolean valid = emailVerificationService.verifyOTP(caller.getEmail(), otp);
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP."));
        }

        caller.setIsDefaultAdmin(true);
        invitationRepository.save(caller);

        return ResponseEntity.ok(Map.of("message", "You are now the Default Admin."));
    }

    // ─── POST /resign-otp — Send OTP to resign from default admin ─────
    @PostMapping("/resign-otp")
    public ResponseEntity<?> requestResignOtp() {
        AdminInvitation caller = getAuthenticatedAdmin();
        if (caller == null)
            return unauthorized();
        if (!Boolean.TRUE.equals(caller.getIsDefaultAdmin())) {
            return forbidden("You are not the default admin.");
        }

        emailVerificationService.sendVerificationOTP(caller.getEmail(), caller.getUsername());
        emailService.sendDefaultAdminOtpEmail(caller.getEmail(), caller.getUsername(), "resign");

        return ResponseEntity.ok(Map.of("message", "OTP sent to " + caller.getEmail()));
    }

    // ─── POST /resign — Verify OTP and resign from default admin ──────
    @PostMapping("/resign")
    public ResponseEntity<?> resignDefaultAdmin(@RequestBody Map<String, String> body) {
        AdminInvitation caller = getAuthenticatedAdmin();
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
        invitationRepository.save(caller);

        return ResponseEntity.ok(Map.of("message", "You have resigned as Default Admin. The position is now open."));
    }

    // ─── DELETE /invitations/{id} — Delete invitation + enrolled admin ─
    @DeleteMapping("/invitations/{id}")
    public ResponseEntity<?> deleteInvitation(@PathVariable Long id) {
        AdminInvitation caller = getAuthenticatedAdmin();
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

        // Cannot delete yourself
        if (inv.getId().equals(caller.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot delete yourself."));
        }
        // Cannot delete another default admin
        if (Boolean.TRUE.equals(inv.getIsDefaultAdmin())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete another default admin."));
        }

        // If the invited admin was enrolled, also delete their user account from users
        // table (if any)
        if (inv.getIsFullyEnrolled() && inv.getUsername() != null) {
            Optional<User> enrolledUser = userRepository.findByUsername(inv.getUsername());
            enrolledUser.ifPresent(userRepository::delete);
        }

        // Delete the invitation record
        invitationRepository.delete(inv);

        return ResponseEntity.ok(Map.of("message", "Invitation and associated admin account deleted successfully."));
    }

    // ─── Helpers ──────────────────────────────────────────────────────
    private AdminInvitation getAuthenticatedAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            // Admin identities live in admin_invitations table
            return invitationRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
    }

    private ResponseEntity<?> forbidden(String msg) {
        return ResponseEntity.status(403).body(Map.of("message", msg));
    }
}
