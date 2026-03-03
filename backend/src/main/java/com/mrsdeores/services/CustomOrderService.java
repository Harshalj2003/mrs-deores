package com.mrsdeores.services;

import com.mrsdeores.models.CustomOrder;
import com.mrsdeores.models.Notification;
import com.mrsdeores.models.User;
import com.mrsdeores.models.ERole;
import com.mrsdeores.repository.CustomOrderRepository;
import com.mrsdeores.repository.NotificationRepository;
import com.mrsdeores.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CustomOrderService {

    @Autowired
    private CustomOrderRepository customOrderRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper to create and save a notification.
     */
    private void createNotification(String title, String message, String type, User targetUser) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        User sender = null;
        if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            sender = userRepository.findByUsername(auth.getName())
                    .orElse(userRepository.findByEmail(auth.getName()).orElse(null));
        }

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setTargetUser(targetUser);
        notification.setSender(sender);
        notificationRepository.save(notification);
    }

    /**
     * User creates a new custom order request.
     */
    public CustomOrder createRequest(CustomOrder customOrder, User user) {
        customOrder.setUser(user);
        customOrder.setStatus("REQUESTED");
        CustomOrder saved = customOrderRepository.save(customOrder);

        // Notify Admins
        List<User> admins = userRepository.findByRoleName(ERole.ROLE_ADMIN);
        for (User admin : admins) {
            createNotification("New Custom Request",
                    "A new custom request for " + saved.getItemName() + " has been placed by " + user.getUsername(),
                    "INFO", admin);
        }

        return saved;
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
        CustomOrder saved = customOrderRepository.save(co);

        createNotification("Custom Request Approved",
                "Your custom request for " + saved.getItemName() + " was approved. Price: ₹" + agreedPrice,
                "SUCCESS", saved.getUser());

        return saved;
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
        CustomOrder saved = customOrderRepository.save(co);

        createNotification("Custom Request Quoted",
                "Your custom request for " + saved.getItemName() + " received a quote: ₹" + agreedPrice,
                "INFO", saved.getUser());

        return saved;
    }

    /**
     * Admin: Reject a request.
     */
    public CustomOrder rejectRequest(Long id, String adminNote) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
        co.setStatus("REJECTED");
        co.setAdminNote(adminNote);
        CustomOrder saved = customOrderRepository.save(co);

        createNotification("Custom Request Rejected",
                "Unfortunately, your request for " + saved.getItemName() + " was rejected.",
                "WARNING", saved.getUser());

        return saved;
    }

    /**
     * User: Negotiate a Quote (reply to admin).
     */
    public CustomOrder negotiateRequest(Long id, User user, String customerNote) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));

        if (!co.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        co.setStatus("NEGOTIATING");
        co.setCustomerNote(customerNote);
        CustomOrder saved = customOrderRepository.save(co);

        // Notify Admins
        List<User> admins = userRepository.findByRoleName(ERole.ROLE_ADMIN);
        for (User admin : admins) {
            createNotification("Custom Request Negotiation",
                    user.getUsername() + " replied to the quote for " + saved.getItemName(),
                    "INFO", admin);
        }

        return saved;
    }

    /**
     * User: Accept a Quote and select payment preference.
     */
    public CustomOrder acceptRequest(Long id, User user, String paymentMode, String customerNote) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));

        if (!co.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        boolean wasApproved = "APPROVED".equals(co.getStatus());
        if (wasApproved) {
            co.setStatus("PAYMENT_PENDING");
        } else {
            co.setStatus("ACCEPTED_BY_CUSTOMER");
        }

        co.setPaymentMode(paymentMode);
        if (customerNote != null && !customerNote.trim().isEmpty()) {
            co.setCustomerNote(customerNote);
        }
        CustomOrder saved = customOrderRepository.save(co);

        // Notify Admins
        List<User> admins = userRepository.findByRoleName(ERole.ROLE_ADMIN);
        for (User admin : admins) {
            if (wasApproved) {
                createNotification("Payment Preference Selected",
                        user.getUsername() + " selected payment mode (" + paymentMode + ") for " + saved.getItemName(),
                        "INFO", admin);
            } else {
                createNotification("Custom Request Accepted!",
                        user.getUsername() + " accepted the quote for " + saved.getItemName() + " (" + paymentMode
                                + ")",
                        "SUCCESS", admin);
            }
        }

        return saved;
    }

    /**
     * System: Update status (e.g., PAID, PROCESSING, SHIPPED, DELIVERED).
     */
    public CustomOrder updateStatus(Long id, String status) {
        CustomOrder co = customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
        co.setStatus(status);
        CustomOrder saved = customOrderRepository.save(co);

        if ("SHIPPED".equalsIgnoreCase(status) || "DELIVERED".equalsIgnoreCase(status)) {
            createNotification("Custom Order " + status,
                    "Your custom order for " + saved.getItemName() + " is now " + status,
                    "SUCCESS", saved.getUser());
        }

        return saved;
    }

    /**
     * Get a single custom order by ID.
     */
    public CustomOrder getById(Long id) {
        return customOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom order not found"));
    }
}
