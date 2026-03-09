package com.mrsdeores.services;

import com.mrsdeores.models.Category;
import com.mrsdeores.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RealTimeUpdateService updateService;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(Category category) {
        Category saved = categoryRepository.save(category);

        // Broadcast the new category as a safe DTO
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("name", saved.getName());
        dto.put("imageUrl", saved.getImageUrl());
        updateService.broadcast("CATEGORY_CREATED", dto);

        return saved;
    }

    public Optional<Category> updateCategory(Integer id, Category updatedData) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(updatedData.getName());
            existing.setDescription(updatedData.getDescription());
            existing.setImageUrl(updatedData.getImageUrl());
            existing.setDisplayOrder(updatedData.getDisplayOrder());
            existing.setGridSize(updatedData.getGridSize());
            existing.setViewMode(updatedData.getViewMode());
            Category saved = categoryRepository.save(existing);

            // Broadcast the update
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", saved.getId());
            dto.put("name", saved.getName());
            dto.put("imageUrl", saved.getImageUrl());
            updateService.broadcast("CATEGORY_UPDATED", dto);

            return saved;
        });
    }

    public boolean deleteCategory(Integer id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);

            // Broadcast deletion
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", id);
            updateService.broadcast("CATEGORY_DELETED", dto);

            return true;
        }
        return false;
    }
}
