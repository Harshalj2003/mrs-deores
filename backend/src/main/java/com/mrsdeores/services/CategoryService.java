package com.mrsdeores.services;

import com.mrsdeores.models.Category;
import com.mrsdeores.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Optional<Category> updateCategory(Integer id, Category updatedData) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(updatedData.getName());
            existing.setDescription(updatedData.getDescription());
            existing.setImageUrl(updatedData.getImageUrl());
            existing.setDisplayOrder(updatedData.getDisplayOrder());
            existing.setGridSize(updatedData.getGridSize());
            existing.setViewMode(updatedData.getViewMode());
            return categoryRepository.save(existing);
        });
    }

    public boolean deleteCategory(Integer id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
