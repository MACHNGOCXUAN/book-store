package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@ToString(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Slf4j
public class Order {
    @Id
    private String orderId;

    private LocalDateTime orderDate;
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    private double totalAmount; // auto tính từ orderDetails

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
    @JoinColumn(name = "discount_code_id", nullable = true)
    private DiscountCode discountCode;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = true)
    private Staff staff;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<OrderHistory> orderHistories = new ArrayList<>();
    /* ----------------- Helpers ----------------- */

    /** Tính lại tổng tiền từ các dòng chi tiết */
    public double calcItemsTotal() {
        return orderDetails == null ? 0.0
                : orderDetails.stream()
                        .mapToDouble(od -> od.getUnitPrice() * od.getQuantity())
                        .sum();
    }

    /** Tổng tiền đã thanh toán */
    public double calcPaidAmount() {
        return payments == null ? 0.0
                : payments.stream()
                        .mapToDouble(Payment::getAmount)
                        .sum();
    }

    /** Gọi thủ công khi bạn muốn cập nhật total trong code dịch vụ (không có discount) */
    public void recalcTotals() {
        this.totalAmount = calcItemsTotal();
    }



    /** Tính tổng tiền có tính đến discount (dùng để check, không set) */
    public double calcTotalWithDiscount() {
        double subtotal = calcItemsTotal();
        if (this.discountCode != null && subtotal > 0) {
            int percent = this.discountCode.getPercent();
            double discountAmount = subtotal * percent / 100.0;
            return subtotal - discountAmount;
        }
        return subtotal;
    }

    /** Tự động cập nhật trước khi insert/update - KHÔNG tính discount vì có thể orderDetails chưa ready */
    @PrePersist
    @PreUpdate
    private void onWrite() {
        // ⚠️ IMPORTANT: Do NOT recalc totalAmount here
        // At @PrePersist time, orderDetails may not be persisted yet
        // Service layer MUST call recalcTotals() or setTotalAmountWithDiscount() BEFORE save()
        log.info("🔵 Order.onWrite() called - totalAmount={}", this.totalAmount);
    }

    /** Tiện phương thức add/remove giữ đồng bộ 2 chiều */
    public void addOrderDetail(OrderDetail d) {
        if (d == null)
            return;
        d.setOrder(this);
        this.orderDetails.add(d);
        // ⚠️ Không set totalAmount ở đây - để cho service layer xử lý qua recalcTotals() hoặc setTotalAmountWithDiscount()
    }

    public void removeOrderDetail(OrderDetail d) {
        if (d == null)
            return;
        this.orderDetails.remove(d);
        d.setOrder(null);
        // ⚠️ Không set totalAmount ở đây - để cho service layer xử lý qua recalcTotals() hoặc setTotalAmountWithDiscount()
    }
}
