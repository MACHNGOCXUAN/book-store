package iuh.fit.backend.repository;

import iuh.fit.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportOrderBookStaffRepository extends JpaRepository<Order, String> {

    // 📌 Tất cả thời gian
    @Query("""
        SELECT od.book.title, SUM(od.quantity)
        FROM Order o JOIN o.orderDetails od
        WHERE o.staff.userId = :staffId
          AND o.status = 'COMPLETED'
        GROUP BY od.book.title
        ORDER BY SUM(od.quantity) DESC
    """)
    List<Object[]> topBooksAll(@Param("staffId") String staffId);

    // 📌 Theo năm
    @Query("""
        SELECT od.book.title, SUM(od.quantity)
        FROM Order o JOIN o.orderDetails od
        WHERE o.staff.userId = :staffId
          AND o.status = 'COMPLETED'
          AND YEAR(o.orderDate) = :year
        GROUP BY od.book.title
        ORDER BY SUM(od.quantity) DESC
    """)
    List<Object[]> topBooksByYear(@Param("staffId") String staffId, @Param("year") int year);

    // 📌 Theo tháng
    @Query("""
        SELECT od.book.title, SUM(od.quantity)
        FROM Order o JOIN o.orderDetails od
        WHERE o.staff.userId = :staffId
          AND o.status = 'COMPLETED'
          AND YEAR(o.orderDate) = :year
          AND MONTH(o.orderDate) = :month
        GROUP BY od.book.title
        ORDER BY SUM(od.quantity) DESC
    """)
    List<Object[]> topBooksByMonth(@Param("staffId") String staffId, @Param("year") int year, @Param("month") int month);

    // 📌 Theo khoảng ngày
    @Query("""
        SELECT od.book.title, SUM(od.quantity)
        FROM Order o JOIN o.orderDetails od
        WHERE o.staff.userId = :staffId
          AND o.status = 'COMPLETED'
          AND o.orderDate BETWEEN :start AND :end
        GROUP BY od.book.title
        ORDER BY SUM(od.quantity) DESC
    """)
    List<Object[]> topBooksByRange(@Param("staffId") String staffId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);
}
