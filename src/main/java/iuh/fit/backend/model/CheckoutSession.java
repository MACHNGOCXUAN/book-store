package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "checkout_sessions")
@Data
public class CheckoutSession {
    @Id
    private String sessionId; // UUID

    private String customerId;

    @Column(columnDefinition = "TEXT")
    private String orderDetailsJson; // Lưu orderDetails dạng JSON

    private Long totalAmount;
    private String voucherId;
    private String discountCode;
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    private SessionStatus status; // PENDING, EXPIRED, COMPLETED

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt; // Hết hạn sau 15 phút

    private String transactionPaymentId;
    private String responseCode;

}