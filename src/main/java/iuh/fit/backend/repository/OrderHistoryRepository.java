package iuh.fit.backend.repository;

import iuh.fit.backend.model.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, String> {
}
