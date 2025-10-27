package iuh.fit.backend.repository;

import iuh.fit.backend.model.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, String> {
    @Query("SELECT MAX(d.discountCodeId) FROM DiscountCode d")
    String findMaxCartId();
}
