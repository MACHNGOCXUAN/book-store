package iuh.fit.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "password_reset_otps",
        indexes = {
                @Index(name = "idx_user_expires", columnList = "userId, expiresAt")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetOTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;              // map với users.user_id
    private String otpHash;             // BCrypt hash của mã 6 số
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt = LocalDateTime.now();
    private Integer attempts = 0;
    private Integer maxAttempts = 5;
    private boolean used = false;
}
