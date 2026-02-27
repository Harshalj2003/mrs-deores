package com.mrsdeores.controllers;

import com.mrsdeores.models.AdminInvitation;
import com.mrsdeores.models.Order;
import com.mrsdeores.models.Product;
import com.mrsdeores.repository.AdminInvitationRepository;
import com.mrsdeores.repository.CategoryRepository;
import com.mrsdeores.repository.CustomOrderRepository;
import com.mrsdeores.repository.OrderRepository;
import com.mrsdeores.repository.ProductRepository;
import com.mrsdeores.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private CategoryRepository categoryRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CustomOrderRepository customOrderRepository;

        @Autowired
        private AdminInvitationRepository adminInvitationRepository;

        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getStats() {
                Map<String, Object> stats = new HashMap<>();

                // ── Orders ──────────────────────────────────────────
                List<Order> allOrders = orderRepository.findAll();
                long totalOrders = allOrders.size();
                long pendingOrders = allOrders.stream()
                                .filter(o -> "CREATED".equalsIgnoreCase(o.getStatus())
                                                || "PENDING".equalsIgnoreCase(o.getStatus()))
                                .count();

                long successfulOrders = allOrders.stream()
                                .filter(o -> List.of("MOCK_PAID", "PAID", "SHIPPED", "DELIVERED")
                                                .contains(o.getStatus() != null ? o.getStatus().toUpperCase() : ""))
                                .count();

                long cancelledOrders = allOrders.stream()
                                .filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus()))
                                .count();

                long returnedOrders = allOrders.stream()
                                .filter(o -> "RETURNED".equalsIgnoreCase(o.getStatus()))
                                .count();

                // Revenue: sum totalAmount for completed/paid orders
                BigDecimal totalRevenue = allOrders.stream()
                                .filter(o -> List.of("MOCK_PAID", "PAID", "SHIPPED", "DELIVERED")
                                                .contains(o.getStatus() != null ? o.getStatus().toUpperCase() : ""))
                                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // ── Products ─────────────────────────────────────────
                List<Product> allProducts = productRepository.findByIsActiveTrue();
                long totalActiveProducts = allProducts.size();
                long inStockProducts = allProducts.stream()
                                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0)
                                .count();
                long outOfStockProducts = totalActiveProducts - inStockProducts;
                long lowStockProducts = allProducts.stream()
                                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0
                                                && p.getStockQuantity() <= 5)
                                .count();

                // ── Categories ───────────────────────────────────────
                long totalCategories = categoryRepository.count();

                // ── Users ────────────────────────────────────────────
                long totalUsers = userRepository.count();
                // Active users = users who placed orders in the last 30 days
                java.time.LocalDate thirtyDaysAgo = java.time.LocalDate.now().minusDays(30);
                long activeUsers = allOrders.stream()
                                .filter(o -> o.getUser() != null && o.getCreatedAt() != null
                                                && o.getCreatedAt().toLocalDate().isAfter(thirtyDaysAgo))
                                .map(o -> o.getUser().getId())
                                .distinct()
                                .count();
                long inactiveUsers = totalUsers - activeUsers;

                // ── Custom Orders ────────────────────────────────────
                long totalCustomOrders = customOrderRepository.count();
                long pendingCustomOrders = customOrderRepository.findAll().stream()
                                .filter(co -> "REQUESTED".equalsIgnoreCase(
                                                co.getStatus() != null ? co.getStatus().toString() : ""))
                                .count();

                // ── Recent Orders (last 5) ───────────────────────────
                List<Map<String, Object>> recentOrders = allOrders.stream()
                                .sorted((a, b) -> b.getCreatedAt() != null && a.getCreatedAt() != null
                                                ? b.getCreatedAt().compareTo(a.getCreatedAt())
                                                : 0)
                                .limit(5)
                                .map(o -> {
                                        Map<String, Object> orderMap = new HashMap<>();
                                        orderMap.put("id", o.getId());
                                        orderMap.put("status", o.getStatus());
                                        orderMap.put("totalAmount", o.getTotalAmount());
                                        orderMap.put("totalItems", o.getTotalItems());
                                        orderMap.put("createdAt",
                                                        o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");
                                        orderMap.put("userName",
                                                        o.getUser() != null ? o.getUser().getUsername() : "Guest");
                                        return orderMap;
                                })
                                .collect(Collectors.toList());

                // ── Build response ───────────────────────────────────
                stats.put("totalOrders", totalOrders);
                stats.put("pendingOrders", pendingOrders);
                stats.put("successfulOrders", successfulOrders);
                stats.put("cancelledOrders", cancelledOrders);
                stats.put("returnedOrders", returnedOrders);
                stats.put("totalRevenue", totalRevenue);
                stats.put("totalActiveProducts", totalActiveProducts);
                stats.put("inStockProducts", inStockProducts);
                stats.put("outOfStockProducts", outOfStockProducts);
                stats.put("lowStockProducts", lowStockProducts);
                stats.put("totalCategories", totalCategories);
                stats.put("totalUsers", totalUsers);
                stats.put("activeUsers", activeUsers);
                stats.put("inactiveUsers", inactiveUsers);
                stats.put("totalCustomOrders", totalCustomOrders);
                stats.put("pendingCustomOrders", pendingCustomOrders);
                stats.put("recentOrders", recentOrders);

                // ── 7-Day Revenue History ───────────────────────────
                java.time.LocalDate today = java.time.LocalDate.now();
                Map<String, BigDecimal> revenueHistory = new java.util.TreeMap<>();
                for (int i = 6; i >= 0; i--) {
                        java.time.LocalDate date = today.minusDays(i);
                        String dateStr = date.toString();
                        BigDecimal dailyRev = allOrders.stream()
                                        .filter(o -> o.getCreatedAt() != null
                                                        && o.getCreatedAt().toLocalDate().equals(date))
                                        .filter(o -> List.of("MOCK_PAID", "PAID", "SHIPPED", "DELIVERED")
                                                        .contains(o.getStatus() != null ? o.getStatus().toUpperCase()
                                                                        : ""))
                                        .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        revenueHistory.put(dateStr, dailyRev);
                }
                stats.put("revenueHistory", revenueHistory);

                // ── Coupon Metrics ──────────────────────────────────
                Map<String, Long> couponMetrics = allOrders.stream()
                                .filter(o -> o.getCouponCode() != null && !o.getCouponCode().isEmpty())
                                .collect(Collectors.groupingBy(Order::getCouponCode, Collectors.counting()));
                stats.put("couponMetrics", couponMetrics);

                return ResponseEntity.ok(stats);
        }

        /**
         * List all admin invitations — for the Invite Team history panel.
         * Returns: email, phone, token (masked), enrollment status, created date.
         */
        @GetMapping("/invitations")
        public ResponseEntity<List<Map<String, Object>>> listInvitations() {
                List<AdminInvitation> invitations = adminInvitationRepository.findAllByOrderByCreatedAtDesc();
                List<Map<String, Object>> result = invitations.stream().map(inv -> {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("id", inv.getId());
                        dto.put("email", inv.getEmail());
                        dto.put("phone", inv.getPhone());
                        // Mask token: show first 8 chars + "..."
                        String token = inv.getInviteToken();
                        dto.put("tokenPreview", token != null && token.length() > 8
                                        ? token.substring(0, 8) + "..."
                                        : token);
                        dto.put("isFullyEnrolled", inv.getIsFullyEnrolled());
                        dto.put("used", inv.getUsed());
                        dto.put("username", inv.getUsername());
                        dto.put("createdAt", inv.getCreatedAt() != null ? inv.getCreatedAt().toString() : null);
                        dto.put("expiresAt", inv.getExpiresAt() != null ? inv.getExpiresAt().toString() : null);
                        return dto;
                }).collect(Collectors.toList());
                return ResponseEntity.ok(result);
        }
}
