package iuh.fit.backend.repository;

import iuh.fit.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {
    Category findByCategoryId(String categoryId);
}
