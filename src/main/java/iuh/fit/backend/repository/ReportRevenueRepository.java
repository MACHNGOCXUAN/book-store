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
    // 🧮 Tổng doanh thu theo tháng trong năm
    // =========================================
    @Query("""
        SELECT MONTH(o.orderDate) AS month, SUM(o.totalAmount)
        FROM Order o
        WHERE YEAR(o.orderDate) = :year AND o.status = 'COMPLETED'
        GROUP BY MONTH(o.orderDate)
        ORDER BY MONTH(o.orderDate)
    """)
    List<Object[]> sumRevenueByMonth(@Param("year") int year);

    // =========================================
    // 📆 Tổng doanh thu từng ngày trong 1 tháng cụ thể
    // =========================================
    @Query("""
        SELECT DAY(o.orderDate) AS day, SUM(o.totalAmount)
        FROM Order o
        WHERE YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month
          AND o.status = 'COMPLETED'
        GROUP BY DAY(o.orderDate)
        ORDER BY DAY(o.orderDate)
    """)
    List<Object[]> sumRevenueByDay(@Param("year") int year, @Param("month") int month);

    // =========================================
    // 📊 Doanh thu theo năm
    // =========================================
    @Query("""
        SELECT YEAR(o.orderDate) AS year, SUM(o.totalAmount)
        FROM Order o
        WHERE o.status = 'COMPLETED'
        GROUP BY YEAR(o.orderDate)
        ORDER BY YEAR(o.orderDate)
    """)
    List<Object[]> sumRevenueByYear();

    // =========================================
    // 🔁 Doanh thu 5 năm gần nhất
    // =========================================
    @Query("""
        SELECT YEAR(o.orderDate) AS year, SUM(o.totalAmount)
        FROM Order o
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
        SELECT DATE(o.orderDate) AS date, SUM(o.totalAmount)
        FROM Order o
        WHERE o.status = 'COMPLETED'
        GROUP BY DATE(o.orderDate)
        ORDER BY SUM(o.totalAmount) DESC
        LIMIT 10
    """)
    List<Object[]> findTopRevenueDays();

    // =========================================
    // ⏱ Doanh thu theo khoảng thời gian
    // =========================================
    @Query("""
        SELECT DATE(o.orderDate), SUM(o.totalAmount)
        FROM Order o
        WHERE o.status = 'COMPLETED' AND DATE(o.orderDate)
              BETWEEN :start AND :end
        GROUP BY DATE(o.orderDate)
        ORDER BY DATE(o.orderDate)
    """)
    List<Object[]> sumRevenueByRange(@Param("start") Date start, @Param("end") Date end);

    // =========================================
    // Lấy danh sách order để tính tổng
    // =========================================
    @Query("SELECT o FROM Order o WHERE YEAR(o.orderDate) = :year")
    List<Order> findByYear(@Param("year") int year);

    @Query("SELECT o FROM Order o WHERE YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month")
    List<Order> findByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT o FROM Order o WHERE DATE(o.orderDate) BETWEEN :start AND :end")
    List<Order> findByRange(@Param("start") Date start, @Param("end") Date end);
}
