package com.mrsdeores.controllers;

import com.mrsdeores.models.CustomOrder;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.services.CustomOrderService;
import com.mrsdeores.payload.response.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/custom-orders")
public class CustomOrderController {

    @Autowired
    private CustomOrderService customOrderService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    // ─── User Endpoints ──────────────────────────────────────────

    /**
     * Create a new custom order request.
     */
    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody CustomOrder customOrder) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Not authenticated"));
        }
        CustomOrder created = customOrderService.createRequest(customOrder, user);
        return ResponseEntity.ok(created);
    }

    /**
     * Get current user's custom order requests.
     */
    @GetMapping("/my")
    public ResponseEntity<List<CustomOrder>> getMyRequests() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(customOrderService.getUserRequests(user));
    }

    /**
     * Get a single custom order by ID (for current user).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequest(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        CustomOrder co = customOrderService.getById(id);
        if (!co.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Not authorized"));
        }
        return ResponseEntity.ok(co);
    }

    // ─── Admin Endpoints ─────────────────────────────────────────

    /**
     * Admin: Get all custom order requests. Optional status filter.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomOrder>> getAllRequests(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(customOrderService.getRequestsByStatus(status));
        }
        return ResponseEntity.ok(customOrderService.getAllRequests());
    }

    /**
     * Admin: Approve a custom order and set the agreed price.
     * Body: { "agreedPrice": 1000.00, "adminNote": "We can do this!" }
     */
    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            BigDecimal agreedPrice = new BigDecimal(payload.get("agreedPrice").toString());
            String adminNote = payload.getOrDefault("adminNote", "").toString();
            return ResponseEntity.ok(customOrderService.approveRequest(id, agreedPrice, adminNote));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Admin: Quote a custom order (propose a price for user review).
     * Body: { "agreedPrice": 800.00, "adminNote": "Here's our best offer." }
     */
    @PutMapping("/admin/{id}/quote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> quoteRequest(@PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            BigDecimal agreedPrice = new BigDecimal(payload.get("agreedPrice").toString());
            String adminNote = payload.getOrDefault("adminNote", "").toString();
            return ResponseEntity.ok(customOrderService.quoteRequest(id, agreedPrice, adminNote));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Admin: Reject a custom order request.
     * Body: { "adminNote": "Sorry, we cannot fulfill this." }
     */
    @PutMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String adminNote = payload.getOrDefault("adminNote", "");
            return ResponseEntity.ok(customOrderService.rejectRequest(id, adminNote));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Admin: Update status of a custom order (e.g., PROCESSING, SHIPPED,
     * DELIVERED).
     * Body: { "status": "SHIPPED" }
     */
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Status is required"));
            }
            return ResponseEntity.ok(customOrderService.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
