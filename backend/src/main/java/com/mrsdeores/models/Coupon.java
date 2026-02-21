package com.mrsdeores.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "discount_type", nullable = false)
    private String discountType; // "PERCENTAGE" or "FIXED"

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "min_order_value")
    private Double minOrderValue = 0.0;

    @Column(name = "max_discount")
    private Double maxDiscount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    private Integer usedCount = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Coupon(String code, String discountType, Double discountValue, LocalDateTime expiryDate,
            Double minOrderValue) {
        this.code = code.toUpperCase();
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.expiryDate = expiryDate;
        this.minOrderValue = minOrderValue;
    }
}
