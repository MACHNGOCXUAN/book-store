package iuh.fit.backend.repository;

import iuh.fit.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, String> {
    Category findByCategoryId(String categoryId);

    @Query("SELECT MAX(c.categoryId) FROM Category c")
    String findIdMaxCategory();

    List<Category> findByCategoryName(String categoryName);
    List<Category> findByCategoryNameContainingIgnoreCase(String name);
}
