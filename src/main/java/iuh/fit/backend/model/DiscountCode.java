package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.DiscountType;
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

    @OneToMany(mappedBy = "discountCode", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Order> order;
}
