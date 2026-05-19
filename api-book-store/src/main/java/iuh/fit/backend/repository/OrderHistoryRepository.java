package iuh.fit.backend.repository;

import iuh.fit.backend.model.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, String> {

    @Query("SELECT MAX(o.id) FROM OrderHistory o")
    String findMaxOrderHistoryId();
}
