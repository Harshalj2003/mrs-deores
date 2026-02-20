package com.mrsdeores.services;

import com.mrsdeores.models.CustomOrder;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.CustomOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CustomOrderService {

    @Autowired
    private CustomOrderRepository customOrderRepository;

    /**
     * User creates a new custom order request.
     */
    public CustomOrder createRequest(CustomOrder customOrder, User user) {
        customOrder.setUser(user);
        customOrder.setStatus("REQUESTED");
        return customOrderRepository.save(customOrder);
    }

    /**
     * Get all custom orders for a specific user.
     */
    public List<CustomOrder> getUserRequests(User user) {
        return customOrderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Admin: Get all custom order requests.
     */
    public List<CustomOrder> getAllRequests() {
        return customOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Admin: Get custom orders filtered by status.
     */
    public List<CustomOrder> getRequestsByStatus(String status) {
        return customOrderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Admin: Approve a request and set the agreed price.
     */
    public CustomOrder approveRequest(Long id, BigDecimal agreedPrice, String adminNote) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
        co.setStatus("APPROVED");
        co.setAgreedPrice(agreedPrice);
        co.setAdminNote(adminNote);
        return customOrderRepository.save(co);
    }

    /**
     * Admin: Quote a request — ask the user to review a proposed price.
     */
    public CustomOrder quoteRequest(Long id, BigDecimal agreedPrice, String adminNote) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
        co.setStatus("QUOTED");
        co.setAgreedPrice(agreedPrice);
        co.setAdminNote(adminNote);
        return customOrderRepository.save(co);
    }

    /**
     * Admin: Reject a request.
     */
    public CustomOrder rejectRequest(Long id, String adminNote) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
        co.setStatus("REJECTED");
        co.setAdminNote(adminNote);
        return customOrderRepository.save(co);
    }

    /**
     * System: Update status (e.g., PAID, PROCESSING, SHIPPED, DELIVERED).
     */
    public CustomOrder updateStatus(Long id, String status) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
        co.setStatus(status);
        return customOrderRepository.save(co);
    }

    /**
     * Get a single custom order by ID.
     */
    public CustomOrder getById(Long id) {
        return customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
    }
}
