package iuh.fit.backend.repository;

import iuh.fit.backend.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, String> {

    @Query("""
           SELECT a FROM Article a
           WHERE (:title IS NULL OR a.title LIKE %:title%)
           AND (:isVisible IS NULL OR a.isVisible = :isVisible)
           """)
    List<Article> search(
            @Param("title") String title,
            @Param("isVisible") Boolean isVisible
    );
}
