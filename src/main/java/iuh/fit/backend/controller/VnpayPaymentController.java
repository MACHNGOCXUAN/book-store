package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.VnpayRequest;
import iuh.fit.backend.service.VnpayPaymentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vnpay/payment")
@AllArgsConstructor
public class VnpayPaymentController {
    private final VnpayPaymentService vnpayService;

    @PostMapping
    public ResponseEntity<String> createPayment(@RequestBody VnpayRequest paymentRequest) {
        try {
            String paymentUrl = vnpayService.createPayment(paymentRequest, "");
            return ResponseEntity.ok(paymentUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi khi tạo thanh toán!");
        }
    }

    @GetMapping("/return")
    public ResponseEntity<String> returnPayment(@RequestParam("vnp_ResponseCode") String responseCode) {
        return vnpayService.handlePaymentReturn(responseCode);
    }
}
