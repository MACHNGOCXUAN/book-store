package iuh.fit.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Lưu voucher riêng cho user
 * Được tạo ra từ:
 * 1. User đổi loyaltyPoints lấy voucher (redeemable=true)
 * 2. Admin cấp voucher cá nhân cho user
 */
@Entity
@Table(name = "user_discount_wallet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UserDiscountWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_code_id", nullable = false)
    private DiscountCode discountCode;

    /**
     * true = voucher đã được dùng trong 1 order
     * false = chưa dùng
     */
    @Builder.Default
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean used = false;

    /**
     * Thời điểm user nhận voucher (đổi hoặc được cấp)
     */
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime acquiredDate = LocalDateTime.now();

    /**
     * Thời điểm voucher được sử dụng (nếu used=true)
     */
    @Column(nullable = true)
    private LocalDateTime usedDate;

    /**
     * OrderId liên kết nếu voucher này đã được dùng
     */
    @Column(nullable = true)
    private String usedInOrderId;

    /* ========== Helpers ========== */

    /**
     * Mark voucher as used
     */
    public void markAsUsed(String orderId) {
        this.used = true;
        this.usedDate = LocalDateTime.now();
        this.usedInOrderId = orderId;
    }

}
