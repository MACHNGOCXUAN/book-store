package iuh.fit.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "order_details")
@Getter @Setter @ToString
@AllArgsConstructor @NoArgsConstructor
public class OrderDetail {
    @Id
    private String orderDetailId;

    private int quantity;
    private double unitPrice;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    /** Thành tiền dòng */
    @Transient
    public double getLineTotal() {
        return unitPrice * quantity;
    }
}

