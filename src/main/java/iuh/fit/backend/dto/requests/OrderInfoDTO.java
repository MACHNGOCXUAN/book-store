package iuh.fit.backend.dto.requests;

import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.enums.PaymentMethod;
import lombok.Data;

import java.util.List;

@Data
public class OrderInfoDTO {
    private String customerId;
    private String discountCode;
    private String voucherId;
    private List<OrderDetailRequest> orderDetails;
    private PaymentMethod paymentMethod;
    @Data
    public static class OrderDetailRequest {
        private String bookId;
        private int quantity;
    }
}