package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Category;
import iuh.fit.backend.repository.CategoryRepository;
import iuh.fit.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public List<Category> findAll(String name) {
        if (name == null || name.trim().isEmpty()) {
            return categoryRepository.findAll();
        } else {
            return categoryRepository.findByCategoryNameContainingIgnoreCase(name);
        }
    }


    @Override
    public Category save(Category category) {
        if (category.getCategoryId() == null || category.getCategoryId().isBlank()) {
            String prefix = "C";
            String lastId = categoryRepository.findIdMaxCategory();
            int nextNum = 1;
            if (lastId != null && lastId.startsWith("C")) {
                try {
                    nextNum = Integer.parseInt(lastId.substring(1)) + 1;
                } catch (NumberFormatException e) {
                    nextNum = 1;
                }
            }
            category.setCategoryId(prefix + String.format("%03d", nextNum));
        }
        return categoryRepository.save(category);
    }

    @Override
    public Category findById(String id) {
        Category category = categoryRepository.findById(id).orElse(null);
        return category;
    }
}
