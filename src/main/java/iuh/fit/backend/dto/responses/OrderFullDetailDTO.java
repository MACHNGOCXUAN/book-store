package iuh.fit.backend.dto.responses;

import iuh.fit.backend.model.Address;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.enums.OrderStatus;
import iuh.fit.backend.model.enums.PaymentMethod;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    // Constructor từ Order model
    public OrderFullDetailDTO(Order order) {
        this.orderId = order.getOrderId();
        this.orderDate = order.getOrderDate();
        this.status = order.getStatus();
        this.totalAmount = order.getTotalAmount();

        // Map Customer
        if (order.getCustomer() != null) {
            this.customer = new CustomerInfoDTO();
            this.customer.userId = order.getCustomer().getUserId();
            this.customer.fullName = order.getCustomer().getFullName();
            this.customer.phoneNumber = order.getCustomer().getPhoneNumber();
            this.customer.email = order.getCustomer().getEmail();
            
            // Lấy địa chỉ mặc định hoặc địa chỉ đầu tiên
            String addressDetails = "";
            if (order.getCustomer().getAddresses() != null && !order.getCustomer().getAddresses().isEmpty()) {
                Address addr = order.getCustomer().getAddresses().get(0);
                addressDetails = String.format("%s, %s, %s, %s", 
                        addr.getSpecifics(), addr.getWard(), addr.getDistrict(), addr.getProvince());
            }
            this.customer.address = addressDetails;
        }

        // Map Discount Code
        if (order.getDiscountCode() != null) {
            this.discountCode = new DiscountInfoDTO();
            this.discountCode.discountCodeId = order.getDiscountCode().getDiscountCodeId();
            this.discountCode.name = order.getDiscountCode().getName();
            this.discountCode.percent = (float) order.getDiscountCode().getPercent();
            
            // Tính discount amount
            double subtotal = order.calcItemsTotal();
            double discountAmount = subtotal * order.getDiscountCode().getPercent() / 100.0;
            this.discountCode.discountAmount = discountAmount;
        }

        // Map Payments
        if (order.getPayments() != null) {
            this.payments = order.getPayments().stream()
                    .map(payment -> {
                        PaymentInfoDTO p = new PaymentInfoDTO();
                        p.paymentId = payment.getPaymentId();
                        p.amount = payment.getAmount();
                        p.method = payment.getMethod();
                        return p;
                    })
                    .collect(Collectors.toList());
        }

        // Map Order Details
        if (order.getOrderDetails() != null) {
            this.orderDetails = order.getOrderDetails().stream()
                    .map(detail -> {
                        OrderDetailWithBookDTO dto = new OrderDetailWithBookDTO();
                        dto.orderDetailId = detail.getOrderDetailId();
                        dto.quantity = detail.getQuantity();
                        dto.unitPrice = detail.getUnitPrice();
                        dto.totalPrice = detail.getUnitPrice() * detail.getQuantity();

                        // Map Book Info
                        if (detail.getBook() != null) {
                            dto.book = new BookInfoDTO();
                            dto.book.bookId = detail.getBook().getBookId();
                            dto.book.title = detail.getBook().getTitle();
                            dto.book.author = detail.getBook().getAuthor();
                            dto.book.publisher = detail.getBook().getPublisher();
                            dto.book.price = detail.getBook().getPrice();
                            dto.book.category = detail.getBook().getCategory() != null ? 
                                    detail.getBook().getCategory().getCategoryName() : "";
                            dto.book.coverImage = detail.getBook().getCoverImage();
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());
        }

        // Map Order Histories
        if (order.getOrderHistories() != null) {
            this.orderHistories = order.getOrderHistories().stream()
                    .map(history -> {
                        OrderHistoryDTO h = new OrderHistoryDTO();
                        h.id = history.getId();
                        h.orderId = history.getOrder().getOrderId();
                        h.timestamp = history.getTimestamp();
                        h.status = history.getStatus();
                        return h;
                    })
                    .collect(Collectors.toList());
        }
    }

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
