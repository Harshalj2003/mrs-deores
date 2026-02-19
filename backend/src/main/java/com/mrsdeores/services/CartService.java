package com.mrsdeores.services;

import com.mrsdeores.models.Cart;
import com.mrsdeores.models.CartItem;
import com.mrsdeores.models.Product;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.CartRepository;
import com.mrsdeores.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Cart getOrCreateCart(User user, String sessionId) {
        if (user != null) {
            return cartRepository.findByUser(user)
                    .orElseGet(() -> {
                        Cart cart = new Cart();
                        cart.setUser(user);
                        return cartRepository.save(cart);
                    });
        } else {
            return cartRepository.findBySessionId(sessionId)
                    .orElseGet(() -> {
                        Cart cart = new Cart();
                        cart.setSessionId(sessionId);
                        return cartRepository.save(cart);
                    });
        }
    }

    @Transactional
    public Cart addToCart(User user, String sessionId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(user, sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.setUpdatedAt(LocalDateTime.now());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(User user, String sessionId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(user, sessionId);

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            if (quantity <= 0) {
                cart.getItems().remove(item);
            } else {
                item.setQuantity(quantity);
                item.setUpdatedAt(LocalDateTime.now());
            }
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(User user, String sessionId, Long productId) {
        Cart cart = getOrCreateCart(user, sessionId);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public void mergeCarts(User user, String sessionId) {
        Optional<Cart> sessionCartOpt = cartRepository.findBySessionId(sessionId);
        if (sessionCartOpt.isPresent()) {
            Cart sessionCart = sessionCartOpt.get();
            // Cart userCart = getOrCreateCart(user, null); // Unused, addToCart handles
            // retrieval

            for (CartItem sessionItem : sessionCart.getItems()) {
                addToCart(user, null, sessionItem.getProduct().getId(), sessionItem.getQuantity());
            }

            cartRepository.delete(sessionCart);
        }
    }
}
