package com.mrsdeores.services;

import com.mrsdeores.models.*;
import com.mrsdeores.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AddressRepository addressRepository;

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

        // 4. Mock Payment
        PaymentDetails payment = new PaymentDetails();
        payment.setPaymentMethod("MOCK_CARD");
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setStatus("COMPLETED");
        payment.setPaymentDate(LocalDateTime.now());

        order.setPaymentDetails(payment);
        order.setStatus("PAID");

        // 5. Save Order
        Order savedOrder = orderRepository.save(order);

        // 6. Clear Cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
