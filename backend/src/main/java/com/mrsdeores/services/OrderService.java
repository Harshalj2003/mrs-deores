package com.mrsdeores.services;

import com.mrsdeores.models.*;
import com.mrsdeores.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private RazorpayService razorpayService;

    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    @Transactional
    public Order createOrder(User user, Long addressId) {
        // 1. Get Cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 2. Get Address
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Invalid address");
        }

        // 3. Create Order
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(address);
        order.setStatus("CREATED");

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            // Calculate effective price (Bulk logic)
            BigDecimal price = cartItem.getEffectivePrice();
            orderItem.setPriceAtPurchase(price);

            order.addOrderItem(orderItem);

            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            totalItems += cartItem.getQuantity();
        }

        order.setTotalAmount(totalAmount);
        order.setTotalItems(totalItems);

        // 4. Create Pending Payment Record
        PaymentDetails payment = new PaymentDetails();
        payment.setPaymentMethod("RAZORPAY");
        payment.setStatus("PENDING");

        order.setPaymentDetails(payment);
        order.setStatus("CREATED");

        // 5. Save Order initially to generate an ID
        Order savedOrder = orderRepository.save(order);

        // 6. Generate Razorpay Order
        try {
            com.razorpay.Order rzpOrder = razorpayService.createOrder(totalAmount, "rcpt_" + savedOrder.getId());
            payment.setRazorpayOrderId(rzpOrder.get("id"));
            // Update the record with the RZP order ID
            savedOrder = orderRepository.save(savedOrder);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize payment gateway: " + e.getMessage(), e);
        }

        // Note: Cart is NO LONGER cleared here. It will be cleared upon successful
        // payment verification.

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status, String trackingNumber, String carrier) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        if (trackingNumber != null)
            order.setTrackingNumber(trackingNumber);
        if (carrier != null)
            order.setCarrier(carrier);
        return orderRepository.save(order);
    }

    @Transactional
    public boolean verifyPayment(Long orderId, String rzpOrderId, String paymentId, String signature, User user) {
        boolean isValid = razorpayService.verifySignature(rzpOrderId, paymentId, signature);
        if (!isValid) {
            return false;
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getUser().getId().equals(user.getId())) {
            return false;
        }

        // Update Payment Details
        PaymentDetails payment = order.getPaymentDetails();
        if (payment != null) {
            payment.setStatus("COMPLETED");
            payment.setRazorpayPaymentId(paymentId);
            payment.setRazorpaySignature(signature);
        }

        // Mark order as PAID
        order.setStatus("PAID");
        orderRepository.save(order);

        // Clear the user's cart now that checkout is securely complete
        cartRepository.findByUser(user).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });

        return true;
    }
}
