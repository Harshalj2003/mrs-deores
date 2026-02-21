package com.mrsdeores.controllers;

import com.mrsdeores.models.User;
import com.mrsdeores.models.Wishlist;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.services.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

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
    public ResponseEntity<Wishlist> getWishlist() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(wishlistService.getOrCreateWishlist(user));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<Wishlist> toggleItem(@PathVariable("productId") Long productId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(wishlistService.toggleItem(user, productId));
    }
}
