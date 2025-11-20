package iuh.fit.backend.payment.momo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoMoPaymentResponse {
    private boolean success;
    private String payUrl;
    private String qrCodeUrl;
    private String deeplink;
    private String message;
}
