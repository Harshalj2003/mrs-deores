package com.mrsdeores.services;

import com.mrsdeores.models.*;
import com.mrsdeores.repository.ProductRepository;
import com.mrsdeores.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Wishlist getOrCreateWishlist(User user) {
        return wishlistRepository.findByUser(user)
                .orElseGet(() -> {
                    Wishlist wishlist = new Wishlist();
                    wishlist.setUser(user);
                    return wishlistRepository.save(wishlist);
                });
    }

    @Transactional
    public Wishlist toggleItem(User user, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(user);

        Optional<WishlistItem> existingItem = wishlist.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            wishlist.getItems().remove(existingItem.get());
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            WishlistItem newItem = new WishlistItem();
            newItem.setWishlist(wishlist);
            newItem.setProduct(product);
            wishlist.getItems().add(newItem);
        }

        return wishlistRepository.save(wishlist);
    }
}
