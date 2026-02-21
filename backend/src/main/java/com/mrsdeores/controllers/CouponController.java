package com.mrsdeores.controllers;

import com.mrsdeores.models.Coupon;
import com.mrsdeores.services.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(
            @RequestParam String code,
            @RequestParam Double orderTotal) {
        try {
            Coupon coupon = couponService.validateCoupon(code, orderTotal);
            Double discount = couponService.calculateDiscount(coupon, orderTotal);

            Map<String, Object> response = new HashMap<>();
            response.put("code", coupon.getCode());
            response.put("discountType", coupon.getDiscountType());
            response.put("discountValue", coupon.getDiscountValue());
            response.put("discountAmount", discount);
            response.put("minOrderValue", coupon.getMinOrderValue());
            response.put("maxDiscount", coupon.getMaxDiscount());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
