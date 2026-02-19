package com.mrsdeores.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    @JsonIgnore
    private Cart cart;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Helper method to calculate price based on quantity (Transient = not stored in
    // DB)
    @Transient
    public BigDecimal getEffectivePrice() {
        if (product == null)
            return BigDecimal.ZERO;
        return (quantity != null && quantity >= product.getBulkMinQuantity() && product.getBulkPrice() != null)
                ? product.getBulkPrice()
                : product.getSellingPrice();
    }

    @Transient
    public BigDecimal getTotalPrice() {
        return getEffectivePrice().multiply(BigDecimal.valueOf(quantity));
    }
}
