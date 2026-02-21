package com.mrsdeores.services;

import com.mrsdeores.models.Coupon;
import com.mrsdeores.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Coupon validateCoupon(String code, Double orderTotal) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code);

        if (couponOpt.isEmpty()) {
            throw new RuntimeException("Invalid or inactive coupon code.");
        }

        Coupon coupon = couponOpt.get();

        // Check expiry
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This coupon has expired.");
        }

        // Check usage limit
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("This coupon has reached its usage limit.");
        }

        // Check min order value
        if (orderTotal < coupon.getMinOrderValue()) {
            throw new RuntimeException(
                    "Order total must be at least ₹" + coupon.getMinOrderValue() + " to use this coupon.");
        }

        return coupon;
    }

    public Double calculateDiscount(Coupon coupon, Double orderTotal) {
        Double discount = 0.0;

        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = (orderTotal * coupon.getDiscountValue()) / 100.0;
            if (coupon.getMaxDiscount() != null && discount > coupon.getMaxDiscount()) {
                discount = coupon.getMaxDiscount();
            }
        } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = coupon.getDiscountValue();
        }

        // Ensure discount doesn't exceed order total
        return Math.min(discount, orderTotal);
    }

    public void incrementUsedCount(String code) {
        couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }
}
