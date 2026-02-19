package com.mrsdeores.controllers;

import com.mrsdeores.models.Product;
import com.mrsdeores.services.ProductService;
import com.mrsdeores.payload.response.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) Integer categoryId) {
        if (categoryId != null) {
            return productService.getProductsByCategory(categoryId);
        }
        return productService.getAllActiveProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productService.getProductById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setMrp(productDetails.getMrp());
            product.setSellingPrice(productDetails.getSellingPrice());
            product.setBulkPrice(productDetails.getBulkPrice());
            product.setBulkMinQuantity(productDetails.getBulkMinQuantity());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setCategory(productDetails.getCategory());
            product.setIsActive(productDetails.getIsActive());
            return ResponseEntity.ok(productService.saveProduct(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully!"));
    }
}
