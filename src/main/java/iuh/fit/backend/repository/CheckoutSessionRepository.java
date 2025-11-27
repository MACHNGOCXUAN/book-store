package iuh.fit.backend.repository;

import iuh.fit.backend.model.CheckoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckoutSessionRepository extends JpaRepository<CheckoutSession, String> {
}