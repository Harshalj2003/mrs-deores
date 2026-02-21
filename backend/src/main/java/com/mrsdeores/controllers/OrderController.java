package com.mrsdeores.controllers;

import com.mrsdeores.models.Order;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

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

    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(orderService.getUserOrders(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Order order = orderService.getOrder(id);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Long> payload) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Long addressId = payload.get("addressId");
        if (addressId == null) {
            return ResponseEntity.badRequest().body("Address ID required");
        }

        try {
            Order order = orderService.createOrder(user, addressId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Admin Endpoints ---

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
