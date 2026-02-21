package com.mrsdeores.controllers;

import com.mrsdeores.models.Category;
import com.mrsdeores.models.Product;
import com.mrsdeores.models.ProductImage;
import com.mrsdeores.repository.CategoryRepository;
import com.mrsdeores.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Intelligent search endpoint — matches against product names, descriptions,
     * and category names.
     * Uses case-insensitive substring matching (equivalent to ILIKE) through Spring
     * Data JPA naming.
     * Results include both products and categories, ranked by match quality.
     *
     * GET /api/search?q=ladoo
     */
    @GetMapping
    public List<Map<String, Object>> search(@RequestParam(name = "q", defaultValue = "") String query) {
        List<Map<String, Object>> results = new ArrayList<>();

        if (query == null || query.trim().length() < 2) {
            return results;
        }

        String q = query.trim().toLowerCase();

        // 1. Search categories by name (highest priority — shown first)
        List<Category> categories = categoryRepository.findAll();
        for (Category cat : categories) {
            if (cat.getName() != null && cat.getName().toLowerCase().contains(q)) {
                Map<String, Object> r = new HashMap<>();
                r.put("type", "category");
                r.put("id", cat.getId());
                r.put("name", cat.getName());
                r.put("description", cat.getDescription());
                r.put("imageUrl", cat.getImageUrl());
                r.put("path", "/category/" + cat.getId());
                results.add(r);
            }
        }

        // 2. Search products by name, description (also match by category name for
        // cross-category discovery)
        List<Product> products = productRepository.findByIsActiveTrue();
        for (Product p : products) {
            boolean nameMatch = p.getName() != null && p.getName().toLowerCase().contains(q);
            boolean descMatch = p.getDescription() != null && p.getDescription().toLowerCase().contains(q);
            boolean catMatch = p.getCategory() != null && p.getCategory().getName() != null
                    && p.getCategory().getName().toLowerCase().contains(q);

            if (nameMatch || descMatch || catMatch) {
                // Avoid duplicating if we already matched the category above
                Map<String, Object> r = new HashMap<>();
                r.put("type", "product");
                r.put("id", p.getId());
                r.put("name", p.getName());
                r.put("description", p.getDescription() != null
                        ? p.getDescription().substring(0, Math.min(80, p.getDescription().length())) + "..."
                        : "");
                r.put("price", p.getSellingPrice());
                r.put("mrp", p.getMrp());
                r.put("categoryName", p.getCategory() != null ? p.getCategory().getName() : "");
                r.put("categoryId", p.getCategory() != null ? p.getCategory().getId() : null);
                r.put("path", "/product/" + p.getId());

                // Get primary image
                String imageUrl = null;
                if (p.getImages() != null) {
                    imageUrl = p.getImages().stream()
                            .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                            .map(ProductImage::getImageUrl)
                            .findFirst()
                            .orElse(p.getImages().isEmpty() ? null : p.getImages().get(0).getImageUrl());
                }
                r.put("imageUrl", imageUrl);

                results.add(r);
            }
        }

        // Limit to 12 results
        return results.subList(0, Math.min(results.size(), 12));
    }
}
