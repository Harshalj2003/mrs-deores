package com.mrsdeores.controllers;

import com.mrsdeores.models.User;
import com.mrsdeores.repository.OrderRepository;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.repository.AddressRepository;
import com.mrsdeores.security.services.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * GET /api/profile/me — Fetch current user's profile + stats.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        long orderCount = orderRepository.countByUser(user);
        long addressCount = addressRepository.countByUser(user);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("fullName", user.getFullName());
        profile.put("bio", user.getBio());
        profile.put("profilePicUrl", user.getProfilePicUrl());
        profile.put("isEmailVerified", user.getIsEmailVerified());
        profile.put("accountStatus", user.getAccountStatus());
        profile.put("createdAt", user.getCreatedAt() != null
                ? user.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null);
        profile.put("lastLoginAt", user.getLastLoginAt() != null
                ? user.getLastLoginAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null);

        // Roles
        profile.put("roles", user.getRoles().stream()
                .map(role -> role.getName().name())
                .toList());

        // Stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orderCount);
        stats.put("savedAddresses", addressCount);
        profile.put("stats", stats);

        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/profile/me — Update editable profile fields.
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        if (body.containsKey("fullName")) {
            String fullName = body.get("fullName");
            if (fullName != null && fullName.length() > 50) {
                return ResponseEntity.badRequest().body(Map.of("message", "Full name must be 50 characters or less."));
            }
            user.setFullName(fullName);
        }

        if (body.containsKey("phone")) {
            String phone = body.get("phone");
            if (phone != null && phone.length() > 20) {
                return ResponseEntity.badRequest().body(Map.of("message", "Phone must be 20 characters or less."));
            }
            user.setPhone(phone);
        }

        if (body.containsKey("bio")) {
            String bio = body.get("bio");
            if (bio != null && bio.length() > 200) {
                return ResponseEntity.badRequest().body(Map.of("message", "Bio must be 200 characters or less."));
            }
            user.setBio(bio);
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully."));
    }

    /**
     * DELETE /api/profile/me — Soft-delete (deactivate) user account. Requires
     * password.
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String password = body.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required to delete your account."));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect password."));
        }

        // Soft-delete: mark as deactivated
        user.setAccountStatus("DEACTIVATED");
        userRepository.save(user);

        return ResponseEntity
                .ok(Map.of("message", "Your account has been deactivated. You can contact support to reactivate."));
    }

    // ─── Helper ──────────────────────────────────────────────────────────
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
}
