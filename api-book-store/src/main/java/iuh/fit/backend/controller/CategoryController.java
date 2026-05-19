package iuh.fit.backend.controller;

import iuh.fit.backend.model.Category;
import iuh.fit.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    @GetMapping
    public ResponseEntity<?> getCategories(@RequestParam(required = false) String name) {
        List<Category> categories = categoryService.findAll(name);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody Category category) {
        Category c = categoryService.save(category);
        return ResponseEntity.ok(c);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@RequestBody Category category, @PathVariable String id) {
        category.setCategoryId(id);
        Category c = categoryService.save(category);
        return ResponseEntity.ok(c);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable String id) {
        Category category = categoryService.findById(id);
        return ResponseEntity.ok().body(category);
    }
}
