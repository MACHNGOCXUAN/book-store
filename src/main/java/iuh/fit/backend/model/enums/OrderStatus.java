package iuh.fit.backend.model.enums;

public enum OrderStatus {
    PENDING,      // Chờ xác nhận (Mới đặt)
    PROCESSING,   // Chờ lấy hàng (Shop đang gói)
    SHIPPING,     // Đang giao hàng (Shipper đang đi)
    COMPLETED,    // Đánh giá (Đã nhận hàng, chờ đánh giá)
    CANCELLED     // Đã hủy
}

