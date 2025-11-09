package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.dto.responses.PaymentQRCodeResponse;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.User;
import iuh.fit.backend.payment.vnpay.VnpayQRCodeService;
// import iuh.fit.backend.payment.vnpay.VnpayService; // TODO: Create this service
import iuh.fit.backend.service.OrderService;
import iuh.fit.backend.service.UserService;
import iuh.fit.backend.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    // private final VnpayService vnpayService; // TODO: Inject when service is
    // created
    private final VnpayQRCodeService qrCodeService;

    @PostMapping()
    public ResponseEntity<?> getAllOrderFilter(@RequestBody OrderFilter orderFilter,
            @RequestHeader("Authorization") String authHeader) {

        System.out.println("📤 OrderFilter received: " + orderFilter);
        System.out.println("   - Status: " + orderFilter.getStatus());
        System.out.println("   - Page: " + orderFilter.getPage());
        System.out.println("   - Limit: " + orderFilter.getLimit());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }
        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);
        User user = userService.findUserById(userId);

        System.out.println("👤 User: " + userId + " (Role: " + user.getRole() + ")");

        Page<OrderFullDetailDTO> ordersPage = orderService.getOrdersFilter(orderFilter, user);
        System.out.println("✅ Found " + ordersPage.getContent().size() + " orders");
        List<OrderFullDetailDTO> orders = ordersPage.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("data", orders);

        Map<String, Object> paging = new HashMap<>();
        paging.put("curPage", ordersPage.getNumber() + 1);
        paging.put("limitPage", ordersPage.getSize());
        paging.put("totalRows", ordersPage.getTotalElements());
        paging.put("totalPage", ordersPage.getTotalPages());

        response.put("paging", paging);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") String id) {
        System.out.println("getOrderById: " + id);
        OrderFullDetailDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/update-status")
    public ResponseEntity<?> updateOrder(@RequestBody UpdateStatusOrderDTO updateStatusOrderDTO,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Missing Authorization header"));
            }

            if (updateStatusOrderDTO == null || updateStatusOrderDTO.getOrderId() == null
                    || updateStatusOrderDTO.getStatus() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid request: orderId and status are required"));
            }

            String token = authHeader.substring(7);
            String userId = jwtUtils.getUserIdFromToken(token);
            User user = userService.findUserById(userId);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }

            System.out.println("📤 Update order status: " + updateStatusOrderDTO.getOrderId()
                    + " -> " + updateStatusOrderDTO.getStatus());

            boolean isSuccess = orderService.updateOrderStatus(updateStatusOrderDTO, user);
            if (isSuccess) {
                System.out.println("✅ Order status updated successfully");
                return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
            } else {
                System.out.println("❌ Order status update failed");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Cập nhật thất bại!"));
            }
        } catch (Exception e) {
            System.err.println("❌ Error updating order status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }

    // New endpoint: cancel order when still PENDING
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable("id") String id,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing Authorization header"));
            }

            String token = authHeader.substring(7);
            String userId = jwtUtils.getUserIdFromToken(token);
            User user = userService.findUserById(userId);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
            }

            boolean success = orderService.cancelOrder(id, user);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Đã hủy đơn thành công"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Không thể hủy đơn. Đơn phải ở trạng thái PENDING và phải là đơn của bạn (nếu bạn là khách)."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }

    @PostMapping("/createOrder")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing Authorization header"));
        }

        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);

        User user = userService.findUserById(userId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token or user not found"));
        }

        try {
            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create order: " + e.getMessage()));
        }
    }

    /**
     * POST /api/orders/checkout
     * Tạo đơn hàng mới và trả về QR Code thanh toán VNPay trong một request
     * Request body: { "customerId", "discountCode", "orderDetails": [...] }
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing Authorization header"));
        }

        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);
        User user = userService.findUserById(userId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token or user not found"));
        }

        try {
            // 1. Tạo đơn hàng
            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            String orderId = createdOrder.getOrderId();
            long totalAmount = Math.round(createdOrder.getTotalAmount());

            // 2. Lấy IP client
            String clientIp = getClientIp(httpRequest);

            // 3. Tạo payment URL từ VNPay (TODO: Implement VnpayService)
            // String paymentUrl = vnpayService.createPaymentUrl(orderId, totalAmount,
            // clientIp);
            String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TmnCode=RDMBOAN3&vnp_TxnRef="
                    + orderId;

            // 4. Sinh QR Code từ payment URL
            String qrCodeBase64 = qrCodeService.generateQRCodeBase64(paymentUrl);

            // 5. Thời gian hết hạn (15 phút)
            long expiresAt = System.currentTimeMillis() + (15 * 60 * 1000);

            // 6. Tạo response với QR code
            PaymentQRCodeResponse paymentResponse = PaymentQRCodeResponse.builder()
                    .orderId(orderId)
                    .amount(totalAmount)
                    .paymentUrl(paymentUrl)
                    .qrCodeBase64(qrCodeBase64)
                    .expiresAt(expiresAt)
                    .message("Order created successfully. Scan QR code to pay.")
                    .build();

            // 7. Combine order info + QR code
            Map<String, Object> response = new HashMap<>();
            response.put("order", createdOrder);
            response.put("payment", paymentResponse);

            System.out.println("✅ Order " + orderId + " created with QR code for checkout");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            System.out.println("❌ RuntimeException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to checkout: " + e.getMessage()));
        }
    }

    // New endpoint: reorder from an existing order (completed or cancelled)
    @PostMapping("/{id}/reorder")
    public ResponseEntity<?> reorder(@PathVariable("id") String id,
                                     @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing Authorization header"));
            }

            String token = authHeader.substring(7);
            String userId = jwtUtils.getUserIdFromToken(token);
            User user = userService.findUserById(userId);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
            }

            try {
                OrderFullDetailDTO newOrder = orderService.reorderFromOrder(id, user);
                return ResponseEntity.status(HttpStatus.CREATED).body(newOrder);
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * Helper: Lấy IP của client
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    /**
     * Cancel an order - only PENDING orders can be cancelled
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable("orderId") String orderId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Missing Authorization header"));
            }

            String token = authHeader.substring(7);
            String userId = jwtUtils.getUserIdFromToken(token);
            User user = userService.findUserById(userId);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }

            System.out.println("📤 Cancel order: " + orderId + " by user: " + userId);

            boolean isSuccess = orderService.cancelOrder(orderId, user);
            if (isSuccess) {
                System.out.println("✅ Order " + orderId + " cancelled successfully");
                return ResponseEntity.ok(Map.of("message", "Đơn hàng đã được hủy"));
            } else {
                System.out.println("❌ Failed to cancel order: " + orderId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message",
                                "Không thể hủy đơn hàng. Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận."));
            }
        } catch (Exception e) {
            System.err.println("❌ Error canceling order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }
}