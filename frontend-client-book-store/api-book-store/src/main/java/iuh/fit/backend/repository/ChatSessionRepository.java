package iuh.fit.backend.repository;

import iuh.fit.backend.model.ChatSession;
import iuh.fit.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    @Query("SELECT cs FROM ChatSession cs WHERE (cs.staff.userId = ?1 OR cs.staff IS NULL) AND cs.isActive = true ORDER BY cs.lastMessageTime DESC")
    List<ChatSession> findActiveSessionsByStaffId(String staffId);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.customer.userId = ?1 AND cs.isActive = true")
    List<ChatSession> findCustomerActiveSessionsByStaffId(String customerId);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.customer.userId = ?1 AND cs.isActive = true")
    Optional<ChatSession> findActiveSessionByCustomerId(String customerId);

    @Query("SELECT cs FROM ChatSession cs WHERE " +
            "(cs.customer.userId = ?1 AND cs.staff.userId = ?2) OR " +
            "(cs.customer.userId = ?2 AND cs.staff.userId = ?1)")
    Optional<ChatSession> findSessionBetweenUsers(String userId1, String userId2);

    @Query("SELECT cs FROM ChatSession cs WHERE cs.customer.userId = ?1 AND (cs.staff.userId = ?2 OR cs.staff IS NULL)")
    Optional<ChatSession> findSessionBetweenCustomerAndStaff(String customerId, String staffId);

}
