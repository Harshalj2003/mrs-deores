package com.mrsdeores.services;

import com.mrsdeores.models.Product;
import com.mrsdeores.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RealTimeUpdateService realTimeUpdateService;

    public List<Product> getAllActiveProducts(Sort sort) {
        return productRepository.findAll(sort).stream()
                .filter(Product::getIsActive)
                .toList();
    }

    public List<Product> getProductsByCategory(Integer categoryId, Sort sort) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId, sort);
    }

    public List<Product> getRelatedProducts(Long productId, Integer categoryId, int limit) {
        return productRepository.findRelatedProducts(productId, categoryId, PageRequest.of(0, limit));
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        Product savedProduct = productRepository.save(product);

        // Create a safe DTO to broadcast instead of raw Hibernate entity
        // which causes LazyInitialization exceptions in Jackson
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", savedProduct.getId());
        dto.put("name", savedProduct.getName());
        dto.put("sellingPrice", savedProduct.getSellingPrice());
        dto.put("stockQuantity", savedProduct.getStockQuantity());
        dto.put("isActive", savedProduct.getIsActive());

        // Make sure to include category ID so frontend can filter
        Map<String, Object> catDto = new HashMap<>();
        catDto.put("id", savedProduct.getCategory().getId());
        dto.put("category", catDto);

        realTimeUpdateService.broadcast("PRODUCT_UPDATED", dto);
        return savedProduct;
    }

    public void deleteProduct(Long id) {
        productRepository.findById(id).ifPresent(product -> {
            product.setIsActive(false);
            productRepository.save(product);

            // Send only the ID since the frontend just removes it from the list
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", id);

            realTimeUpdateService.broadcast("PRODUCT_DELETED", dto);
        });
    }
}
