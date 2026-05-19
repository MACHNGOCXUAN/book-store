package iuh.fit.backend.repository;

import iuh.fit.backend.model.PasswordResetOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PasswordResetOTPRepository extends JpaRepository<PasswordResetOTP, Long> {
    @Query("select o from PasswordResetOTP o where o.userId = :userId and o.used = false and o.expiresAt > :now order by o.createdAt desc")
    List<PasswordResetOTP> findActiveByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);
}
