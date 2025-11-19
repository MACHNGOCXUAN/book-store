package iuh.fit.backend.dto.responses;

import iuh.fit.backend.model.enums.OrderStatus;
import iuh.fit.backend.model.enums.PaymentMethod;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderFullDetailDTO {
    private String orderId;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private Double totalAmount;

    // Discount Information
    private DiscountInfoDTO discountCode;

    // Customer (User) Information
    private CustomerInfoDTO customer;

    // Payment Information (Support multiple payments)
    private List<PaymentInfoDTO> payments;

    // Order Details with Book Information
    private List<OrderDetailWithBookDTO> orderDetails;

    private List<OrderHistoryDTO>orderHistories;

    @Data
    public static class CustomerInfoDTO {
        private String userId;
        private String fullName;
        private String phoneNumber;
        private String email;
        private String address;
    }

    @Data
    public static class PaymentInfoDTO {
        private String paymentId;
        private Float amount;
        private PaymentMethod method;
    }

    @Data
    public static class DiscountInfoDTO {
        private String discountCodeId;
        private String name;
        private Float percent;
        private Double discountAmount;
    }

    @Data
    public static class OrderDetailWithBookDTO {
        private String orderDetailId;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;

        // Book Information
        private BookInfoDTO book;
    }

    @Data
    public static class BookInfoDTO {
        private String bookId;
        private String title;
        private String author;
        private String publisher;
        private Double price;
        private String category;
        private String coverImage;
    }

    @Data
    public  static class OrderHistoryDTO {
        private String id;
        private String orderId;
        private LocalDateTime timestamp;
        private OrderStatus status;
    }
}
