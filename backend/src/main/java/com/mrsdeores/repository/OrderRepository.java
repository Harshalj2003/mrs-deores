package com.mrsdeores.repository;

import com.mrsdeores.models.Order;
import com.mrsdeores.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.mrsdeores.models.Product;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderItems oi WHERE o.user = :user AND oi.product = :product AND o.status IN ('PAID', 'DELIVERED', 'MOCK_PAID')")
    boolean hasUserPurchasedProduct(@Param("user") User user, @Param("product") Product product);
}
