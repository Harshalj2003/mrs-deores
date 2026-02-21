package com.mrsdeores.services;

import com.mrsdeores.models.Product;
import com.mrsdeores.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

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
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.findById(id).ifPresent(product -> {
            product.setIsActive(false);
            productRepository.save(product);
        });
    }
}
