package iuh.fit.backend.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để trả về thông tin QR code cho việc thanh toán VNPay
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentQRCodeResponse {
    private String orderId; // ID của đơn hàng
    private Long amount; // Số tiền (VND)
    private String paymentUrl; // URL thanh toán VNPay
    private String qrCodeBase64; // QR code dạng Base64 (data:image/png;base64,...)
    private String message; // Thông báo
    private long expiresAt; // Thời gian hết hạn QR (milliseconds)
}
