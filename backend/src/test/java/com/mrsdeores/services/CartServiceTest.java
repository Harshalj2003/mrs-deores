package com.mrsdeores.services;

import com.mrsdeores.models.Cart;
import com.mrsdeores.models.CartItem;
import com.mrsdeores.models.Product;
import com.mrsdeores.models.User;
import com.mrsdeores.repository.CartRepository;
import com.mrsdeores.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    public void testBulkPricingLogic() {
        // Arrange
        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product");
        product.setSellingPrice(new BigDecimal("100.00"));
        product.setBulkPrice(new BigDecimal("80.00"));
        product.setBulkMinQuantity(50);

        User user = new User();
        user.setId(1L);

        Cart cart = new Cart();
        cart.setUser(user);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArguments()[0]);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act 1: Add 49 items (Should be selling price)
        Cart updatedCart = cartService.addToCart(user, null, 1L, 49);
        CartItem item = updatedCart.getItems().get(0);

        assertEquals(new BigDecimal("100.00"), item.getEffectivePrice());
        assertEquals(new BigDecimal("4900.00"), item.getTotalPrice());

        // Act 2: Add 1 more item (Total 50, Should be bulk price)
        updatedCart = cartService.addToCart(user, null, 1L, 1);
        item = updatedCart.getItems().get(0);

        assertEquals(new BigDecimal("80.00"), item.getEffectivePrice());
        assertEquals(new BigDecimal("4000.00"), item.getTotalPrice());
    }
}
