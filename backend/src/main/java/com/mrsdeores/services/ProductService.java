package com.mrsdeores.services;

import com.mrsdeores.models.Product;
import com.mrsdeores.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }

    public List<Product> getProductsByCategory(Integer categoryId) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
}
