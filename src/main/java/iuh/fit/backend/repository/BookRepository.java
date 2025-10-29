package iuh.fit.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import iuh.fit.backend.model.Category;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.backend.model.Book;

@Repository
public interface BookRepository extends JpaRepository<Book, String>, JpaSpecificationExecutor<Book> {
        List<Book> findByTitleContainingIgnoreCase(String title);

        @Query("""
                        SELECT b
                        FROM Book b
                        JOIN OrderDetail od ON od.book.bookId = b.bookId
                        JOIN Order o ON od.order.orderId = o.orderId
                        GROUP BY b
                        ORDER BY SUM(od.quantity) DESC
                        """)
        List<Book> findTop20BestsellerBooks(Pageable pageable);

        @Query("""
                        SELECT b
                        FROM Book b
                        JOIN OrderDetail od ON od.book.bookId = b.bookId
                        JOIN Order o ON od.order.orderId = o.orderId
                        WHERE o.orderDate >= :startDate
                        GROUP BY b
                        ORDER BY SUM(od.quantity) DESC
                        """)
        List<Book> findTop20BestsellerBooksByWeek(@Param("startDate") LocalDateTime startDate, Pageable pageable);

        @Query("""
                        SELECT b
                        FROM Book b
                        JOIN OrderDetail od ON od.book.bookId = b.bookId
                        JOIN Order o ON od.order.orderId = o.orderId
                        WHERE o.orderDate >= :startDate
                        GROUP BY b
                        ORDER BY SUM(od.quantity) DESC
                        """)
        List<Book> findTop20BestsellerBooksByMonth(@Param("startDate") LocalDateTime startDate, Pageable pageable);

        @Query("""
                        SELECT b
                        FROM Book b
                        JOIN OrderDetail od ON od.book.bookId = b.bookId
                        JOIN Order o ON od.order.orderId = o.orderId
                        WHERE o.orderDate >= :startDate
                        GROUP BY b
                        ORDER BY SUM(od.quantity) DESC
                        """)
        List<Book> findTop20BestsellerBooksByYear(@Param("startDate") LocalDateTime startDate, Pageable pageable);

        List<Book> findByCategoryCategoryId(String categoryId);
}
