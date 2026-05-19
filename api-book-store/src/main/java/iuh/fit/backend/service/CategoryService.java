package iuh.fit.backend.service;

import iuh.fit.backend.model.Category;

import java.util.List;

public interface CategoryService {
    List<Category> findAll(String name);
    Category save(Category category);
    Category findById(String id);
}
