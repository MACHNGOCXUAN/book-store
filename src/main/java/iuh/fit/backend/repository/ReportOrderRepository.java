package iuh.fit.backend.repository;

import iuh.fit.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportOrderRepository extends JpaRepository<Order, String> {

    // ✅ 1️⃣ Theo tháng trong năm (chia theo trạng thái)
    @Query("""
        SELECT MONTH(o.orderDate) AS month, o.status AS status, COUNT(o.orderId) AS total
        FROM Order o
        WHERE YEAR(o.orderDate) = :year
        GROUP BY MONTH(o.orderDate), o.status
        ORDER BY MONTH(o.orderDate), o.status
    """)
    List<Object[]> sumOrderByMonth(@Param("year") int year);

    // ✅ 2️⃣ Theo ngày trong tháng (chia theo trạng thái)
    @Query("""
        SELECT DAY(o.orderDate) AS day, o.status AS status, COUNT(o.orderId) AS total
        FROM Order o
        WHERE YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month
        GROUP BY DAY(o.orderDate), o.status
        ORDER BY DAY(o.orderDate), o.status
    """)
    List<Object[]> sumOrderByDay(@Param("year") int year, @Param("month") int month);

    // ✅ 3️⃣ Theo khoảng thời gian (chia theo trạng thái)
    @Query("""
        SELECT FUNCTION('DATE', o.orderDate) AS date, o.status AS status, COUNT(o.orderId) AS total
        FROM Order o
        WHERE o.orderDate >= :startDate AND o.orderDate <= :endDate
        GROUP BY FUNCTION('DATE', o.orderDate), o.status
        ORDER BY FUNCTION('DATE', o.orderDate), o.status
    """)
    List<Object[]> sumOrderByRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ✅ 4️⃣ Thống kê theo thể loại sách (ăn theo bộ lọc thời gian)
    // 🔸 4.1. Theo Năm
    @Query("""
        SELECT b.category AS category, SUM(od.quantity) AS totalSold
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE YEAR(o.orderDate) = :year
        GROUP BY b.category
        ORDER BY totalSold DESC
    """)
    List<Object[]> sumBooksByCategoryInYear(@Param("year") int year);

    // 🔸 4.2. Theo Tháng trong Năm
    @Query("""
        SELECT b.category AS category, SUM(od.quantity) AS totalSold
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month
        GROUP BY b.category
        ORDER BY totalSold DESC
    """)
    List<Object[]> sumBooksByCategoryInMonth(@Param("year") int year, @Param("month") int month);

    // 🔸 4.3. Theo Khoảng thời gian cụ thể
    @Query("""
        SELECT b.category AS category, SUM(od.quantity) AS totalSold
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE o.orderDate BETWEEN :startDate AND :endDate
        GROUP BY b.category
        ORDER BY totalSold DESC
    """)
    List<Object[]> sumBooksByCategoryInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
