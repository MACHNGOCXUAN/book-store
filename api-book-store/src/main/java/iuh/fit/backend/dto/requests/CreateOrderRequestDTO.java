package iuh.fit.backend.dto.requests;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequestDTO {
    private String customerId;
    private String discountCode; // nullable - cho discount code text
    private String voucherId; // nullable - cho voucher ID từ wallet
    private String paymentMethod; // COD, VNPAY, MOMO
    private List<OrderDetailRequest> orderDetails;

    @Data
    public static class OrderDetailRequest {
        private String bookId;
        private int quantity;
    }
}