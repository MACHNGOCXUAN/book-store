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

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
        @Query("SELECT o FROM Order o " +
                        "WHERE (:status IS NULL OR o.status = :status) " +
                        "AND (:startTime IS NULL OR o.orderDate >= :startTime) " +
                        "AND (:endTime IS NULL OR o.orderDate <= :endTime) " +
                        "AND (:textSearch IS NULL OR o.orderId LIKE %:textSearch% " +
                        "OR o.customer.fullName LIKE %:textSearch%)")
        Page<Order> findByFilter(@Param("status") OrderStatus status,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("textSearch") String textSearch,
                        Pageable pageable);

        @Query("SELECT o FROM Order o " +
                        "WHERE (:status IS NULL OR o.status = :status) " +
                        "AND (:startTime IS NULL OR o.orderDate >= :startTime) " +
                        "AND (:endTime IS NULL OR o.orderDate <= :endTime) " +
                        "AND (:textSearch IS NULL OR LOWER(o.orderId) LIKE LOWER(CONCAT('%', :textSearch, '%')) " +
                        "     OR LOWER(o.customer.fullName) LIKE LOWER(CONCAT('%', :textSearch, '%'))) " +
                        "AND ((:status = 'PENDING' AND o.staff IS NULL) OR (o.staff.userId = :staffId AND :status != 'PENDING'))")
        Page<Order> findByFilterStaff(
                        @Param("status") OrderStatus status,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("textSearch") String textSearch,
                        @Param("staffId") String staffId,
                        Pageable pageable);

        @Query("SELECT o FROM Order o " +
                        "WHERE o.customer.userId = :customerId " +
                        "AND (:status IS NULL OR o.status = :status) " +
                        "AND (:startTime IS NULL OR o.orderDate >= :startTime) " +
                        "AND (:endTime IS NULL OR o.orderDate <= :endTime) " +
                        "AND (:textSearch IS NULL OR LOWER(o.orderId) LIKE LOWER(CONCAT('%', :textSearch, '%')))")
        Page<Order> findByFilterCustomer(
                        @Param("status") OrderStatus status,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("textSearch") String textSearch,
                        @Param("customerId") String customerId,
                        Pageable pageable);

        @Query("SELECT MAX(o.orderId) FROM Order o")
        String findMaxOrderId();
}