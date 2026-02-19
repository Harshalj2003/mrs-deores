package com.mrsdeores.controllers;

import com.mrsdeores.models.Cart;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

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
    public ResponseEntity<Cart> getCart(@RequestParam(required = false) String sessionId) {
        User user = getAuthenticatedUser();
        if (user == null && sessionId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cartService.getOrCreateCart(user, sessionId));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addToCart(@RequestBody Map<String, Object> payload,
            @RequestParam(required = false) String sessionId) {
        User user = getAuthenticatedUser();
        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());

        return ResponseEntity.ok(cartService.addToCart(user, sessionId, productId, quantity));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<Cart> updateItem(@PathVariable Long productId, @RequestBody Map<String, Object> payload,
            @RequestParam(required = false) String sessionId) {
        User user = getAuthenticatedUser();
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateItemQuantity(user, sessionId, productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItem(@PathVariable Long productId,
            @RequestParam(required = false) String sessionId) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(cartService.removeItem(user, sessionId, productId));
    }

    @PostMapping("/merge")
    public ResponseEntity<?> mergeCart(@RequestParam String sessionId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        cartService.mergeCarts(user, sessionId);
        return ResponseEntity.ok().build();
    }
}
