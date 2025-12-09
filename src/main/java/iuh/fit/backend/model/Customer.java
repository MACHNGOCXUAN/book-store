package iuh.fit.backend.model;

import jakarta.persistence.*;
import lombok.*;
import iuh.fit.backend.model.enums.CustomerTier;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(callSuper = true)
@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer loyaltyPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'NEW_USER'")
    private CustomerTier tier = CustomerTier.NEW_USER;

    private Boolean hasStaff;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private Cart cart;

    @ManyToMany
    @JoinTable(
            name = "favorites",
            joinColumns = @JoinColumn(name = "customer_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    @ToString.Exclude
    @JsonIgnore
    private Set<Book> favoriteBooks = new HashSet<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private List<Address> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private List<UserDiscountWallet> discountWallet = new ArrayList<>();

    /* ========== Loyalty Methods ========== */

    /**
     * Cộng điểm loyalty và tự động cập nhật tier
     * @param points số điểm cần cộng
     * @return true nếu tier thay đổi, false nếu tier không đổi
     */
    public boolean addLoyaltyPoints(int points) {
        CustomerTier oldTier = this.tier;
        this.loyaltyPoints = (this.loyaltyPoints == null ? 0 : this.loyaltyPoints) + points;
        this.tier = CustomerTier.getTierByPoints(this.loyaltyPoints);
        return !oldTier.equals(this.tier);
    }

    /**
     * Trừ điểm loyalty (khi đổi voucher)
     * @param points số điểm cần trừ
     * @return true nếu có đủ điểm, false nếu không
     */
    public boolean redeemLoyaltyPoints(int points) {
        if (this.loyaltyPoints == null) this.loyaltyPoints = 0;
        if (this.loyaltyPoints >= points) {
            this.loyaltyPoints -= points;
            return true;
        }
        return false;
    }

    /**
     * Check xem có đủ điểm không
     */
    public boolean hasEnoughPoints(int requiredPoints) {
        return (this.loyaltyPoints == null ? 0 : this.loyaltyPoints) >= requiredPoints;
    }
}
