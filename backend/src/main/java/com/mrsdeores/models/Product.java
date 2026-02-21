package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal mrp;

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice;

    @Column(name = "bulk_price")
    private BigDecimal bulkPrice;

    @Column(name = "bulk_min_quantity")
    private Integer bulkMinQuantity = 50;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "average_rating")
    private Double averageRating = 5.0; // Default to 5 star for new products or as requested

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Product(String name, String description, BigDecimal mrp, BigDecimal sellingPrice, Category category) {
        this.name = name;
        this.description = description;
        this.mrp = mrp;
        this.sellingPrice = sellingPrice;
        this.category = category;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
