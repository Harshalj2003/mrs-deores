package com.mrsdeores.repository;

import com.mrsdeores.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Long countByProductId(Long productId);
}
