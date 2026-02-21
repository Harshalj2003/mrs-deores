package com.mrsdeores.controllers;

import com.mrsdeores.models.Product;
import com.mrsdeores.models.Review;
import com.mrsdeores.models.User;
import com.mrsdeores.payload.request.ReviewRequest;
import com.mrsdeores.payload.response.MessageResponse;
import com.mrsdeores.repository.ProductRepository;
import com.mrsdeores.repository.UserRepository;
import com.mrsdeores.services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addReview(@Valid @RequestBody ReviewRequest request) {
        User user = getAuthenticatedUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Error: Product not found."));

        try {
            Review review = reviewService.addReview(user, product, request.getRating(), request.getComment());
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getProductReviewStats(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductRatingStats(productId));
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
    }
}
