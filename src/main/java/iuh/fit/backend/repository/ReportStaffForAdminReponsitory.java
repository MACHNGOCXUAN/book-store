package iuh.fit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import iuh.fit.backend.model.Order;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportStaffForAdminReponsitory extends JpaRepository<Order, String> {

    // ✅ Top nhân viên theo tổng doanh thu (tất cả thời gian)
    @Query("""
        SELECT o.staff.userId, o.staff.userName, SUM(o.totalAmount)
        FROM Order o
        WHERE o.status = 'COMPLETED'
        GROUP BY o.staff.userId, o.staff.userName
        ORDER BY SUM(o.totalAmount) DESC
    """)
    List<Object[]> topStaffAllTime();

    // ✅ Top nhân viên theo năm
    @Query("""
        SELECT o.staff.userId, o.staff.userName, SUM(o.totalAmount)
        FROM Order o
        WHERE o.status = 'COMPLETED'
          AND YEAR(o.orderDate) = :year
        GROUP BY o.staff.userId, o.staff.userName
        ORDER BY SUM(o.totalAmount) DESC
    """)
    List<Object[]> topStaffByYear(@Param("year") int year);

    // ✅ Top nhân viên theo tháng của 1 năm
    @Query("""
        SELECT o.staff.userId, o.staff.userName, SUM(o.totalAmount)
        FROM Order o
        WHERE o.status = 'COMPLETED'
          AND YEAR(o.orderDate) = :year
          AND MONTH(o.orderDate) = :month
        GROUP BY o.staff.userId, o.staff.userName
        ORDER BY SUM(o.totalAmount) DESC
    """)
    List<Object[]> topStaffByMonth(
            @Param("year") int year,
            @Param("month") int month
    );

    // ✅ Top nhân viên theo khoảng ngày
    @Query("""
        SELECT o.staff.userId, o.staff.userName, SUM(o.totalAmount)
        FROM Order o
        WHERE o.status = 'COMPLETED'
          AND o.orderDate BETWEEN :start AND :end
        GROUP BY o.staff.userId, o.staff.userName
        ORDER BY SUM(o.totalAmount) DESC
    """)
    List<Object[]> topStaffByRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
