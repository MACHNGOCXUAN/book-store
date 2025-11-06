package iuh.fit.backend.repository;

import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    // Admin/Staff tổng quát
    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
          AND (:startTime IS NULL OR o.orderDate >= :startTime)
          AND (:endTime IS NULL OR o.orderDate <= :endTime)
          AND (:textSearch IS NULL OR o.orderId LIKE %:textSearch%
               OR o.customer.fullName LIKE %:textSearch%)
        """)
    Page<Order> findByFilter(@Param("status") OrderStatus status,
                             @Param("startTime") LocalDateTime startTime,
                             @Param("endTime") LocalDateTime endTime,
                             @Param("textSearch") String textSearch,
                             Pageable pageable);

    // Staff: xem đơn của mình; nếu status=PENDING thì trả đơn CHƯA được gán; nếu khác PENDING thì trả đơn gán cho staff đó
    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
          AND (:startTime IS NULL OR o.orderDate >= :startTime)
          AND (:endTime IS NULL OR o.orderDate <= :endTime)
          AND (:textSearch IS NULL OR LOWER(o.orderId) LIKE LOWER(CONCAT('%', :textSearch, '%'))
               OR LOWER(o.customer.fullName) LIKE LOWER(CONCAT('%', :textSearch, '%')))
          AND (
                (:status = iuh.fit.backend.model.enums.OrderStatus.PENDING AND o.staff IS NULL)
             OR (o.staff.userId = :staffId AND (:status IS NULL OR :status <> iuh.fit.backend.model.enums.OrderStatus.PENDING))
          )
        """)
    Page<Order> findByFilterStaff(@Param("status") OrderStatus status,
                                  @Param("startTime") LocalDateTime startTime,
                                  @Param("endTime") LocalDateTime endTime,
                                  @Param("textSearch") String textSearch,
                                  @Param("staffId") String staffId,
                                  Pageable pageable);

    // Lọc theo Customer
    @Query("""
        SELECT o FROM Order o
        WHERE o.customer.userId = :customerId
          AND (:status IS NULL OR o.status = :status)
          AND (:startTime IS NULL OR o.orderDate >= :startTime)
          AND (:endTime IS NULL OR o.orderDate <= :endTime)
          AND (:textSearch IS NULL OR LOWER(o.orderId) LIKE LOWER(CONCAT('%', :textSearch, '%')))
        """)
    Page<Order> findByFilterCustomer(@Param("status") OrderStatus status,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime,
                                     @Param("textSearch") String textSearch,
                                     @Param("customerId") String customerId,
                                     Pageable pageable);

    @Query("SELECT MAX(o.orderId) FROM Order o")
    String findMaxOrderId();

    // --- Staff thống kê / danh sách ---
    @Query("""
        SELECT o FROM Order o
        WHERE o.staff.userId = :staffId
          AND o.status = iuh.fit.backend.model.enums.OrderStatus.COMPLETED
        """)
    List<Order> findAllByStaffId(@Param("staffId") String staffId);

    @Query("""
        SELECT FUNCTION('DATE', o.orderDate) AS date, SUM(o.totalAmount) AS revenue
        FROM Order o
        WHERE o.staff.userId = :staffId
          AND o.orderDate BETWEEN :start AND :end
          AND o.status = iuh.fit.backend.model.enums.OrderStatus.COMPLETED
        GROUP BY FUNCTION('DATE', o.orderDate)
        ORDER BY FUNCTION('DATE', o.orderDate)
        """)
    List<Object[]> sumRevenueByDateForStaff(@Param("staffId") String staffId,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);

    @Query("""
        SELECT FUNCTION('MONTH', o.orderDate), SUM(o.totalAmount)
        FROM Order o
        WHERE o.staff.userId = :staffId
          AND FUNCTION('YEAR', o.orderDate) = :year
          AND o.status = iuh.fit.backend.model.enums.OrderStatus.COMPLETED
        GROUP BY FUNCTION('MONTH', o.orderDate)
        ORDER BY FUNCTION('MONTH', o.orderDate)
        """)
    List<Object[]> sumRevenueByMonthInYearForStaff(@Param("staffId") String staffId,
                                                   @Param("year") int year);

    @Query("""
        SELECT FUNCTION('DAY', o.orderDate), SUM(o.totalAmount)
        FROM Order o
        WHERE o.staff.userId = :staffId
          AND FUNCTION('YEAR', o.orderDate) = :year
          AND FUNCTION('MONTH', o.orderDate) = :month
          AND o.status = iuh.fit.backend.model.enums.OrderStatus.COMPLETED
        GROUP BY FUNCTION('DAY', o.orderDate)
        ORDER BY FUNCTION('DAY', o.orderDate)
        """)
    List<Object[]> sumRevenueByDayInMonthForStaff(@Param("staffId") String staffId,
                                                  @Param("year") int year,
                                                  @Param("month") int month);

    @Query("""
        SELECT FUNCTION('MONTH', o.orderDate), COUNT(o)
        FROM Order o
        WHERE o.staff.userId = :staffId
          AND FUNCTION('YEAR', o.orderDate) = :year
        GROUP BY FUNCTION('MONTH', o.orderDate)
        ORDER BY FUNCTION('MONTH', o.orderDate)
        """)
    List<Object[]> sumOrdersByMonthInYearForStaff(@Param("staffId") String staffId,
                                                  @Param("year") int year);

    @Query("""
        SELECT FUNCTION('DAY', o.orderDate), COUNT(o)
        FROM Order o
        WHERE o.staff.userId = :staffId
          AND FUNCTION('YEAR', o.orderDate) = :year
          AND FUNCTION('MONTH', o.orderDate) = :month
        GROUP BY FUNCTION('DAY', o.orderDate)
        ORDER BY FUNCTION('DAY', o.orderDate)
        """)
    List<Object[]> sumOrdersByDayInMonthForStaff(@Param("staffId") String staffId,
                                                 @Param("year") int year,
                                                 @Param("month") int month);

    @Query("""
        SELECT FUNCTION('DATE', o.orderDate), COUNT(o)
        FROM Order o
        WHERE o.staff.userId = :staffId
          AND o.orderDate BETWEEN :start AND :end
        GROUP BY FUNCTION('DATE', o.orderDate)
        ORDER BY FUNCTION('DATE', o.orderDate)
        """)
    List<Object[]> sumOrdersByDateRangeForStaff(@Param("staffId") String staffId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);
}
