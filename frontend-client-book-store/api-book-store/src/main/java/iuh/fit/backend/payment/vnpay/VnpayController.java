package iuh.fit.backend.payment.vnpay;

import iuh.fit.backend.dto.responses.PaymentQRCodeResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
public class VnpayController {
    private final VnpayQRCodeService qrCodeService;

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("message", "VnPay controller is running"));
    }

}
