package iuh.fit.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "cart_items")
@Getter @Setter @ToString
@AllArgsConstructor @NoArgsConstructor
public class CartItem {
    @Id
    private String cartItemId;

    private int quantity;
    private double unitPrice;

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Transient
    public double getLineTotal() {
        return unitPrice * quantity;
    }
}

