package iuh.fit.backend.repository;

import iuh.fit.backend.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String>, JpaSpecificationExecutor<Book> {
    List<Book> findByTitleContainingIgnoreCase(String title);
    @Query("SELECT MAX(b.bookId) FROM Book b")
    String findMaxBookId();
}
