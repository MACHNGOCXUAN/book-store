package iuh.fit.backend.repository;

import iuh.fit.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    @Query("SELECT p.paymentId FROM Payment p ORDER BY p.paymentId DESC LIMIT 1")
    String findMaxPaymentId();

    Payment findByTransactionId(String transactionId);
}
