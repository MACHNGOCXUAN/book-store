package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter @ToString
@Entity @Table(name = "payments")
public class Payment {
    @Id
    private String paymentId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;        // 1 order - n payments

    private float amount;       // có thể dùng BigDecimal trong thực tế
    @Enumerated(EnumType.STRING)
    private PaymentMethod method;
}
