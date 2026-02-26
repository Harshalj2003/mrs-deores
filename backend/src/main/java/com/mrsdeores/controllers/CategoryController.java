package com.mrsdeores.controllers;

import com.mrsdeores.models.Category;
import com.mrsdeores.services.CategoryService;
import com.mrsdeores.services.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Integer id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(category));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Integer id, @RequestBody Category category) {
        // Capture old publicId BEFORE update so we can clean it up if image changed
        String oldPublicId = categoryService.getCategoryById(id)
                .map(Category::getPublicId)
                .orElse(null);
        String oldResourceType = categoryService.getCategoryById(id)
                .map(c -> c.getResourceType() != null ? c.getResourceType() : "image")
                .orElse("image");

        return categoryService.updateCategory(id, category)
                .map(updated -> {
                    // Delete old Cloudinary asset only if image was replaced
                    boolean imageChanged = category.getPublicId() != null
                            && !category.getPublicId().equals(oldPublicId);
                    if (imageChanged && oldPublicId != null) {
                        cloudinaryService.deleteMedia(oldPublicId, oldResourceType);
                    }
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        // Capture publicId BEFORE deletion for Cloudinary cleanup
        String publicId = categoryService.getCategoryById(id).map(Category::getPublicId).orElse(null);
        String resourceType = categoryService.getCategoryById(id)
                .map(c -> c.getResourceType() != null ? c.getResourceType() : "image")
                .orElse("image");

        if (categoryService.deleteCategory(id)) {
            // Delete from Cloudinary AFTER DB delete succeeds
            cloudinaryService.deleteMedia(publicId, resourceType);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
