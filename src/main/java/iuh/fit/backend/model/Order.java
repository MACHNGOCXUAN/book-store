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

    /** Số tiền còn nợ = tổng đơn - đã thanh toán (không âm) */
    public double calcDueAmount() {
        double due = calcItemsTotal() - calcPaidAmount();
        return due < 0 ? 0 : due;
    }

    /** Gọi thủ công khi bạn muốn cập nhật total trong code dịch vụ (không có discount) */
    public void recalcTotals() {
        this.totalAmount = calcItemsTotal();
    }

    /** Gọi khi có discount - tính total với discount đã trừ */
    public void setTotalAmountWithDiscount() {
        if (this.discountCode != null) {
            double subtotal = calcItemsTotal();
            int percent = this.discountCode.getPercent();
            double discountAmount = subtotal * percent / 100.0;
            this.totalAmount = subtotal - discountAmount;
            log.info("💰 setTotalAmountWithDiscount: subtotal={}, percent={}, discountAmount={}, finalTotal={}", 
                    subtotal, percent, discountAmount, this.totalAmount);
        } else {
            this.totalAmount = calcItemsTotal();
            log.info("💰 setTotalAmountWithDiscount (NO DISCOUNT): totalAmount={}", this.totalAmount);
        }
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
        // ⚠️ IMPORTANT: Khi @PrePersist được gọi, orderDetails chưa chắc đã được persist
        // Nên chỉ tính những order KHÔNG có discount ở đây
        // Với discount, service layer phải gọi setTotalAmountWithDiscount() trước khi save
        
        if (this.discountCode == null) {
            // Không có discount, tính từ items
            this.totalAmount = calcItemsTotal();
            log.info("🔵 Order.onWrite() (NO DISCOUNT): set totalAmount={}", this.totalAmount);
        } else {
            // Có discount, không thay đổi totalAmount (đã được set bởi service)
            log.info("🔵 Order.onWrite() (HAS DISCOUNT): keeping totalAmount={}", this.totalAmount);
        }
    }

    /** Tiện phương thức add/remove giữ đồng bộ 2 chiều */
    public void addOrderDetail(OrderDetail d) {
        if (d == null)
            return;
        d.setOrder(this);
        this.orderDetails.add(d);
        this.totalAmount = calcItemsTotal();
    }

    public void removeOrderDetail(OrderDetail d) {
        if (d == null)
            return;
        this.orderDetails.remove(d);
        d.setOrder(null);
        this.totalAmount = calcItemsTotal();
    }
}
