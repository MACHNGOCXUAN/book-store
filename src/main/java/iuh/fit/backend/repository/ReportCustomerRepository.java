package iuh.fit.backend.repository;

import iuh.fit.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportCustomerRepository extends JpaRepository<Customer, String> {

    // ✅ 1️⃣ Thống kê KH mới theo tháng trong năm
    @Query("""
        SELECT MONTH(c.registrationDate) AS month, COUNT(c.userId) AS total
        FROM Customer c
        WHERE YEAR(c.registrationDate) = :year
        GROUP BY MONTH(c.registrationDate)
        ORDER BY MONTH(c.registrationDate)
    """)
    List<Object[]> countNewCustomersByMonth(int year);

    // ✅ 2️⃣ Thống kê KH mới theo ngày trong tháng
    @Query("""
        SELECT DAY(c.registrationDate) AS day, COUNT(c.userId) AS total
        FROM Customer c
        WHERE YEAR(c.registrationDate) = :year AND MONTH(c.registrationDate) = :month
        GROUP BY DAY(c.registrationDate)
        ORDER BY DAY(c.registrationDate)
    """)
    List<Object[]> countNewCustomersByDay(int year, int month);

    // ✅ 3️⃣ Thống kê KH mới trong khoảng thời gian
    @Query("""
        SELECT DATE(c.registrationDate) AS date, COUNT(c.userId) AS total
        FROM Customer c
        WHERE c.registrationDate BETWEEN :start AND :end
        GROUP BY DATE(c.registrationDate)
        ORDER BY DATE(c.registrationDate)
    """)
    List<Object[]> countNewCustomersByRange(LocalDateTime start, LocalDateTime end);

    // ✅ 4️⃣ Top KH có nhiều đơn hàng nhất (sửa chuẩn JPQL)
    @Query("""
        SELECT c.fullName, COUNT(o) AS totalOrders
        FROM Order o
        JOIN o.customer c
        GROUP BY c.fullName
        ORDER BY COUNT(o) DESC
    """)
    List<Object[]> topCustomersByOrderCount();
    @Query("""
    SELECT COUNT(c)
    FROM Customer c
    WHERE DATE(c.registrationDate) = :date
""")
    long countByRegistrationDate(@Param("date") LocalDate date);

}
