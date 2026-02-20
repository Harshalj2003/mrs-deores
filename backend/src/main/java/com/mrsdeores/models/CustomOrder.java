package com.mrsdeores.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_orders")
@Data
@NoArgsConstructor
public class CustomOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password", "roles" })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer quantity = 1;

    private BigDecimal budget;

    @Column(nullable = false, length = 50)
    private String status = "REQUESTED";

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "agreed_price")
    private BigDecimal agreedPrice;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "orderItems", "user" })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order linkedOrder;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "images" })
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_product_id")
    private Product referenceProduct;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
