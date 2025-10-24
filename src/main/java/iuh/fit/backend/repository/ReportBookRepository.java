package iuh.fit.backend.repository;

import iuh.fit.backend.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportBookRepository extends JpaRepository<Book, String> {

    // ✅ Thống kê sách bán chạy trong năm
    @Query("""
        SELECT b.title, SUM(od.quantity) AS totalSold
        FROM OrderDetail od
        JOIN od.book b
        JOIN od.order o
        WHERE YEAR(o.orderDate) = :year
        GROUP BY b.title
        ORDER BY totalSold DESC
    """)
    List<Object[]> sumBooksSoldByMonth(int year);

    // ✅ Thống kê theo tháng cụ thể
    @Query("""
        SELECT b.title, SUM(od.quantity) AS totalSold
        FROM OrderDetail od
        JOIN od.book b
        JOIN od.order o
        WHERE YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month
        GROUP BY b.title
        ORDER BY totalSold DESC
    """)
    List<Object[]> sumBooksSoldByDay(int year, int month);

    // ✅ Thống kê theo khoảng thời gian
    @Query("""
        SELECT b.title, SUM(od.quantity) AS totalSold
        FROM OrderDetail od
        JOIN od.book b
        JOIN od.order o
        WHERE o.orderDate BETWEEN :start AND :end
        GROUP BY b.title
        ORDER BY totalSold DESC
    """)
    List<Object[]> sumBooksSoldByRange(LocalDateTime start, LocalDateTime end);

    // ✅ Top bán chạy không lọc
    @Query("""
        SELECT b.title, SUM(od.quantity) AS totalSold
        FROM OrderDetail od
        JOIN od.book b
        GROUP BY b.title
        ORDER BY totalSold DESC
    """)
    List<Object[]> topSellingBooks();

    // ✅ Sách tồn kho thấp hơn 15
    @Query("""
        SELECT b.bookId, b.title, b.stock
        FROM Book b
        WHERE b.stock < 15
        ORDER BY b.stock ASC
    """)
    List<Object[]> findLowStockBooks();
}
