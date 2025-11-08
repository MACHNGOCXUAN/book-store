package iuh.fit.backend.repository;

import iuh.fit.backend.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    @Query("""
        SELECT b.title, b.category, SUM(od.quantity) AS qty, SUM(od.quantity * od.unitPrice) AS total
        FROM OrderDetail od
        JOIN od.order o
        JOIN od.book b
        WHERE o.staff.userId = :staffId
          AND o.status = 'COMPLETED'
        GROUP BY b.title, b.category
        ORDER BY total DESC
    """)
    List<Object[]> findBooksSoldByStaff(@Param("staffId") String staffId);

    @Query("SELECT MAX(o.orderDetailId) FROM OrderDetail o")
    String findMaxOrderDetailId();

    // Add: get list of OrderDetail by the parent Order's orderId
    List<OrderDetail> findByOrderOrderId(String orderId);
}
