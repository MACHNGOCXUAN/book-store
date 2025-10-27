package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "orders")
@Getter @Setter @ToString(callSuper = true)
@AllArgsConstructor @NoArgsConstructor
public class Order {
    @Id
    private String orderId;

    private LocalDateTime orderDate;
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    private double totalAmount;   // auto tính từ orderDetails

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<OrderDetail> orderDetails = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Payment> payments = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<OrderHistory> orderHistories = new ArrayList<>();
    /* ----------------- Helpers ----------------- */

    /** Tính lại tổng tiền từ các dòng chi tiết */
    public double calcItemsTotal() {
        return orderDetails == null ? 0.0 :
                orderDetails.stream()
                        .mapToDouble(od -> od.getUnitPrice() * od.getQuantity())
                        .sum();
    }

    /** Tổng tiền đã thanh toán */
    public double calcPaidAmount() {
        return payments == null ? 0.0 :
                payments.stream()
                        .mapToDouble(Payment::getAmount)
                        .sum();
    }

    /** Số tiền còn nợ = tổng đơn - đã thanh toán (không âm) */
    public double calcDueAmount() {
        double due = calcItemsTotal() - calcPaidAmount();
        return due < 0 ? 0 : due;
    }

    /** Gọi thủ công khi bạn muốn cập nhật total trong code dịch vụ */
    public void recalcTotals() {
        this.totalAmount = calcItemsTotal();
    }

    /** Tự động cập nhật trước khi insert/update */
    @PrePersist @PreUpdate
    private void onWrite() {
        this.totalAmount = calcItemsTotal();
    }

    /** Tiện phương thức add/remove giữ đồng bộ 2 chiều */
    public void addOrderDetail(OrderDetail d) {
        if (d == null) return;
        d.setOrder(this);
        this.orderDetails.add(d);
        this.totalAmount = calcItemsTotal();
    }
    public void removeOrderDetail(OrderDetail d) {
        if (d == null) return;
        this.orderDetails.remove(d);
        d.setOrder(null);
        this.totalAmount = calcItemsTotal();
    }
}
