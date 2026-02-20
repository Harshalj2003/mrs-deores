package com.mrsdeores.repository;

import com.mrsdeores.models.CustomOrder;
import com.mrsdeores.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomOrderRepository extends JpaRepository<CustomOrder, Long> {
    List<CustomOrder> findByUserOrderByCreatedAtDesc(User user);

    List<CustomOrder> findAllByOrderByCreatedAtDesc();

    List<CustomOrder> findByStatusOrderByCreatedAtDesc(String status);
}
