package com.mrsdeores.services;

import com.mrsdeores.models.Product;
import com.mrsdeores.models.Review;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.OrderRepository;
import com.mrsdeores.repository.ProductRepository;
import com.mrsdeores.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Review addReview(User user, Product product, Integer rating, String comment) {
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new RuntimeException("You have already reviewed this product.");
        }

        boolean isVerified = orderRepository.hasUserPurchasedProduct(user, product);

        Review review = new Review(user, product, rating, comment, isVerified);
        Review savedReview = reviewRepository.save(review);

        // Update product stats
        updateProductRatingStats(product);

        return savedReview;
    }

    private void updateProductRatingStats(Product product) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        product.setAverageRating(Math.round(average * 10.0) / 10.0);
        product.setTotalReviews(reviews.size());
        productRepository.save(product);
    }

    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public Map<String, Object> getProductRatingStats(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        long count = reviews.size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", Math.round(average * 10.0) / 10.0);
        stats.put("totalReviews", count);

        // Distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            int finalI = i;
            distribution.put(i, reviews.stream().filter(r -> r.getRating() == finalI).count());
        }
        stats.put("ratingDistribution", distribution);

        return stats;
    }
}
