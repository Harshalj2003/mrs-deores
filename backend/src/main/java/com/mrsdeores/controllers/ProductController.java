package com.mrsdeores.controllers;

import com.mrsdeores.models.Product;
import com.mrsdeores.models.ProductImage;
import com.mrsdeores.models.Category;
import com.mrsdeores.services.ProductService;
import com.mrsdeores.services.CategoryService;
import com.mrsdeores.payload.response.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

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
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> body) {
        try {
            Integer categoryId = (Integer) body.get("categoryId");
            Category category = categoryService.getCategoryById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            Product product = new Product();
            product.setName((String) body.get("name"));
            product.setDescription((String) body.get("description"));
            product.setMrp(new BigDecimal(body.get("mrp").toString()));
            product.setSellingPrice(new BigDecimal(body.get("sellingPrice").toString()));
            if (body.get("bulkPrice") != null) {
                product.setBulkPrice(new BigDecimal(body.get("bulkPrice").toString()));
            }
            if (body.get("bulkMinQuantity") != null) {
                product.setBulkMinQuantity((Integer) body.get("bulkMinQuantity"));
            }
            if (body.get("stockQuantity") != null) {
                product.setStockQuantity((Integer) body.get("stockQuantity"));
            }
            product.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);
            product.setCategory(category);

            Product saved = productService.saveProduct(product);

            // Add images if provided
            if (body.get("imageUrls") != null) {
                @SuppressWarnings("unchecked")
                List<String> imageUrls = (List<String>) body.get("imageUrls");
                addImagesToProduct(saved, imageUrls);
                saved = productService.saveProduct(saved);
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating product: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return productService.getProductById(id).map(product -> {
            try {
                if (body.get("name") != null)
                    product.setName((String) body.get("name"));
                if (body.get("description") != null)
                    product.setDescription((String) body.get("description"));
                if (body.get("mrp") != null)
                    product.setMrp(new BigDecimal(body.get("mrp").toString()));
                if (body.get("sellingPrice") != null)
                    product.setSellingPrice(new BigDecimal(body.get("sellingPrice").toString()));
                if (body.get("bulkPrice") != null)
                    product.setBulkPrice(new BigDecimal(body.get("bulkPrice").toString()));
                if (body.get("bulkMinQuantity") != null)
                    product.setBulkMinQuantity(Integer.parseInt(body.get("bulkMinQuantity").toString()));
                if (body.get("stockQuantity") != null)
                    product.setStockQuantity(Integer.parseInt(body.get("stockQuantity").toString()));
                if (body.get("isActive") != null)
                    product.setIsActive((Boolean) body.get("isActive"));

                // Handle category change
                if (body.get("categoryId") != null) {
                    Integer categoryId = Integer.parseInt(body.get("categoryId").toString());
                    Category category = categoryService.getCategoryById(categoryId)
                            .orElseThrow(() -> new RuntimeException("Category not found"));
                    product.setCategory(category);
                }

                // Handle image URLs update
                if (body.get("imageUrls") != null) {
                    // Clear existing images and add new ones
                    product.getImages().clear();
                    @SuppressWarnings("unchecked")
                    List<String> imageUrls = (List<String>) body.get("imageUrls");
                    addImagesToProduct(product, imageUrls);
                }

                return ResponseEntity.ok(productService.saveProduct(product));
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error updating product: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully!"));
    }

    private void addImagesToProduct(Product product, List<String> imageUrls) {
        for (int i = 0; i < imageUrls.size(); i++) {
            String url = imageUrls.get(i);
            if (url != null && !url.trim().isEmpty()) {
                ProductImage img = new ProductImage(url.trim(), product, i == 0);
                product.getImages().add(img);
            }
        }
    }
}
