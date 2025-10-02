package iuh.fit.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "carts")
@Getter @Setter @ToString
@AllArgsConstructor @NoArgsConstructor
public class Cart {
    @Id
    private String cartId;

    private LocalDate createdDate;
    private double totalAmount;   // auto tính từ items

    @OneToOne
    @JoinColumn(name = "customer_id", unique = true, nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<CartItem> items = new ArrayList<>();

    /* ----------------- Helpers ----------------- */

    public double calcItemsTotal() {
        return items == null ? 0.0 :
                items.stream()
                        .mapToDouble(CartItem::getLineTotal)
                        .sum();
    }

    public void recalcTotals() {
        this.totalAmount = calcItemsTotal();
    }

    @PrePersist @PreUpdate
    private void onWrite() {
        this.totalAmount = calcItemsTotal();
    }

    public void addItem(CartItem it) {
        if (it == null) return;
        it.setCart(this);
        this.items.add(it);
        this.totalAmount = calcItemsTotal();
    }
    public void removeItem(CartItem it) {
        if (it == null) return;
        this.items.remove(it);
        it.setCart(null);
        this.totalAmount = calcItemsTotal();
    }
}
