package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.PaymentMethod;
import iuh.fit.backend.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    private String paymentId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order; // 1 order - n payments

    private Long amount;
    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    private String paymentUrl;
    private LocalDateTime paymentCreatedAt;
    private LocalDateTime paymentCompletedAt;
    private String transactionId;
    private String responseCode;

    // QR Code fields cho VNPay
    @Column(columnDefinition = "LONGTEXT")
    private String qrCodeBase64; // QR code dạng Base64 (data:image/png;base64,...)

    @Column(length = 50)
    private String vnpTransactionId; // ID giao dịch từ VNPay (vnp_TxnRef)

    @Column(length = 10)
    private String vnpResponseCode; // Response code từ VNPay (00 = success)
}
