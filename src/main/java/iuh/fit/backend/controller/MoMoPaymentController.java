package iuh.fit.backend.controller;

import java.util.HashMap;
import java.util.Map;

import iuh.fit.backend.payment.momo.MoMoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
@Slf4j
public class MoMoPaymentController {

    private final MoMoService moMoService;
    private final OrderService orderService;

    /**
     * IPN (Instant Payment Notification) endpoint
     * MoMo sẽ gọi endpoint này sau khi thanh toán thành công
     */
    @PostMapping("/ipn")
    public ResponseEntity<?> handleIPN(@RequestBody Map<String, String> ipnData) {
        log.info("📥 MoMo IPN received: {}", ipnData);

        try {
            // 1. Verify signature
            boolean isValid = moMoService.verifySignature(ipnData);
            if (!isValid) {
                log.error("❌ Invalid MoMo signature");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid signature"));
            }

            // 2. Get order info
            String orderId = ipnData.get("orderId");
            String resultCode = ipnData.get("resultCode");
            String transId = ipnData.get("transId");
            String message = ipnData.get("message");

            log.info("✅ Valid MoMo IPN: orderId={}, resultCode={}, transId={}, message={}", 
                    orderId, resultCode, transId, message);

            // 3. Check result code
            if ("0".equals(resultCode)) {
                // Thanh toán thành công
                log.info("💰 Payment successful for order: {}", orderId);
                
                // Cập nhật trạng thái đơn hàng thành PENDING (đợi xác nhận)
                // TODO: Implement updateOrderStatusAfterPayment in OrderService
                // orderService.updateOrderStatusAfterPayment(orderId, OrderStatus.PENDING);
                
                return ResponseEntity.ok(Map.of("message", "Payment confirmed"));
            } else {
                // Thanh toán thất bại
                log.warn("⚠️ Payment failed for order {}: {}", orderId, message);
                
                // Có thể cập nhật trạng thái đơn hàng về CANCELLED hoặc giữ nguyên
                // orderService.updateOrderStatusAfterPayment(orderId, OrderStatus.CANCELLED);
                
                return ResponseEntity.ok(Map.of("message", "Payment failed"));
            }

        } catch (Exception e) {
            log.error("❌ Error processing MoMo IPN: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal error"));
        }
    }

    /**
     * Return URL - trang frontend redirect sau khi thanh toán
     * Frontend sẽ tự xử lý việc hiển thị kết quả
     */
    @GetMapping("/return")
    public ResponseEntity<?> handleReturn(@RequestParam Map<String, String> params) {
        log.info("📥 MoMo Return URL called: {}", params);
        
        String orderId = params.get("orderId");
        String resultCode = params.get("resultCode");
        
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("success", "0".equals(resultCode));
        response.put("message", "0".equals(resultCode) ? "Thanh toán thành công" : "Thanh toán thất bại");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Check payment status by orderId
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable String orderId) {
        // TODO: Implement logic to check payment status from database
        // For now, return a placeholder response
        
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("status", "PENDING");
        response.put("message", "Use this endpoint to check payment status");
        
        return ResponseEntity.ok(response);
    }
}
