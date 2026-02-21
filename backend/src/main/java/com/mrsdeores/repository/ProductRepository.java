package com.mrsdeores.repository;

import com.mrsdeores.models.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryIdAndIsActiveTrue(Integer categoryId, org.springframework.data.domain.Sort sort);

    List<Product> findByIsActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id != :productId AND p.isActive = true")
    List<Product> findRelatedProducts(@Param("productId") Long productId, @Param("categoryId") Integer categoryId,
            Pageable pageable);
}
