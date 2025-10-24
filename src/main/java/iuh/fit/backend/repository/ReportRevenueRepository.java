package iuh.fit.backend.repository;

import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;

public interface ReportRevenueRepository extends JpaRepository<Order, String> {
    long countByStatus(OrderStatus status);

    // =========================================
    // 🧮 Doanh thu & lợi nhuận theo tháng
    // =========================================
    @Query("""
        SELECT MONTH(o.orderDate) AS month,
               SUM(od.quantity * od.unitPrice) AS revenue,
               SUM(od.quantity * (od.unitPrice - b.importPrice)) AS profit
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE YEAR(o.orderDate) = :year
          AND o.status = 'COMPLETED'
        GROUP BY MONTH(o.orderDate)
        ORDER BY MONTH(o.orderDate)
    """)
    List<Object[]> sumRevenueByMonth(@Param("year") int year);

    // =========================================
    // 📆 Doanh thu & lợi nhuận theo ngày trong tháng cụ thể
    // =========================================
    @Query("""
        SELECT DAY(o.orderDate) AS day,
               SUM(od.quantity * od.unitPrice) AS revenue,
               SUM(od.quantity * (od.unitPrice - b.importPrice)) AS profit
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE YEAR(o.orderDate) = :year
          AND MONTH(o.orderDate) = :month
          AND o.status = 'COMPLETED'
        GROUP BY DAY(o.orderDate)
        ORDER BY DAY(o.orderDate)
    """)
    List<Object[]> sumRevenueByDay(@Param("year") int year, @Param("month") int month);

    // =========================================
    // 📊 Doanh thu & lợi nhuận theo năm
    // =========================================
    @Query("""
        SELECT YEAR(o.orderDate) AS year,
               SUM(od.quantity * od.unitPrice) AS revenue,
               SUM(od.quantity * (od.unitPrice - b.importPrice)) AS profit
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE o.status = 'COMPLETED'
        GROUP BY YEAR(o.orderDate)
        ORDER BY YEAR(o.orderDate)
    """)
    List<Object[]> sumRevenueByYear();

    // =========================================
    // 🔁 Doanh thu & lợi nhuận 5 năm gần nhất
    // =========================================
    @Query("""
        SELECT YEAR(o.orderDate) AS year,
               SUM(od.quantity * od.unitPrice) AS revenue,
               SUM(od.quantity * (od.unitPrice - b.importPrice)) AS profit
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE YEAR(o.orderDate) BETWEEN :startYear AND :endYear
          AND o.status = 'COMPLETED'
        GROUP BY YEAR(o.orderDate)
        ORDER BY YEAR(o.orderDate)
    """)
    List<Object[]> sumRevenueInRangeYears(@Param("startYear") int startYear,
                                          @Param("endYear") int endYear);

    // =========================================
    // 🏆 Top 10 ngày có doanh thu cao nhất
    // =========================================
    @Query("""
        SELECT DATE(o.orderDate) AS date,
               SUM(od.quantity * od.unitPrice) AS revenue,
               SUM(od.quantity * (od.unitPrice - b.importPrice)) AS profit
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE o.status = 'COMPLETED'
        GROUP BY DATE(o.orderDate)
        ORDER BY SUM(od.quantity * od.unitPrice) DESC
        LIMIT 10
    """)
    List<Object[]> findTopRevenueDays();

    // =========================================
    // ⏱ Doanh thu & lợi nhuận theo khoảng thời gian
    // =========================================
    @Query("""
        SELECT DATE(o.orderDate),
               SUM(od.quantity * od.unitPrice) AS revenue,
               SUM(od.quantity * (od.unitPrice - b.importPrice)) AS profit
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE o.status = 'COMPLETED'
          AND DATE(o.orderDate) BETWEEN :start AND :end
        GROUP BY DATE(o.orderDate)
        ORDER BY DATE(o.orderDate)
    """)
    List<Object[]> sumRevenueByRange(@Param("start") Date start, @Param("end") Date end);

    // =========================================
    // ✅ Đếm đơn hàng hoàn thành theo thời gian
    // =========================================
    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE YEAR(o.orderDate) = :year
          AND o.status = 'COMPLETED'
    """)
    long countCompletedByYear(@Param("year") int year);

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE YEAR(o.orderDate) = :year
          AND MONTH(o.orderDate) = :month
          AND o.status = 'COMPLETED'
    """)
    long countCompletedByMonth(@Param("year") int year, @Param("month") int month);

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE DATE(o.orderDate) BETWEEN :start AND :end
          AND o.status = 'COMPLETED'
    """)
    long countCompletedByRange(@Param("start") Date start, @Param("end") Date end);
    @Query("""
    SELECT o
    FROM Order o
    WHERE DATE(o.orderDate) BETWEEN :start AND :end
""")
    List<Order> findByOrderDateBetween(@Param("start") Date start, @Param("end") Date end);

}
