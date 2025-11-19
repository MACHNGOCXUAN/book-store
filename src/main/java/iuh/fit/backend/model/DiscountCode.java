package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.model.enums.CustomerTier;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor @NoArgsConstructor
@Data
@Entity
@Table(name = "discount_codes")
public class DiscountCode {
    @Id
    private String discountCodeId;
    private String name;
    private int percent;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private int quantity;
    private double minPriceToApply;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;
    private int maxQuantityCanUse;

    /* ========== New Fields for Loyalty+Tier System ========== */

    /**
     * true = Public voucher (tất cả customer nhìn thấy & dùng)
     * false = Personalized voucher (chỉ user được cấp mới dùng)
     */
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean isPublic = true;

    /**
     * true = Có thể đổi bằng loyaltyPoints
     * false = Không thể đổi, chỉ là voucher thường
     */
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean redeemable = false;

    /**
     * Số loyaltyPoints cần để đổi voucher này
     * (chỉ áp dụng nếu redeemable=true)
     */
    @Column(nullable = true)
    private Integer redeemCost;

    /**
     * Min tier yêu cầu để dùng voucher
     * null = không ràng buộc tier
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private CustomerTier minTierRequired;

    @JsonIgnore
    @OneToMany(mappedBy = "discountCode", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Order> order;

    @JsonIgnore
    @OneToMany(mappedBy = "discountCode", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<UserDiscountWallet> wallets;
}
