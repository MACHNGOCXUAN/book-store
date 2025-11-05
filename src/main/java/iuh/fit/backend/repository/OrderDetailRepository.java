package iuh.fit.backend.repository;

import iuh.fit.backend.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, String> {
    @Query("SELECT MAX(od.orderDetailId) FROM OrderDetail od")
    String findMaxOrderDetailId();
}