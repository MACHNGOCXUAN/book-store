package iuh.fit.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import iuh.fit.backend.payment.momo.MoMoPaymentResponse;
import iuh.fit.backend.payment.momo.MoMoService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.dto.responses.PaymentQRCodeResponse;
import iuh.fit.backend.model.Book;
import iuh.fit.backend.model.User;
import iuh.fit.backend.payment.vnpay.VnpayQRCodeService;
import iuh.fit.backend.payment.vnpay.VnpayService;
import iuh.fit.backend.service.BookService;
import iuh.fit.backend.service.OrderService;
import iuh.fit.backend.service.UserService;
import iuh.fit.backend.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final BookService bookService;
    private final VnpayService vnpayService;
    private final VnpayQRCodeService qrCodeService;
    private final MoMoService moMoService;

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
     * POST /api/orders/create-momo-payment-only
     * Chỉ tạo MoMo payment request, KHÔNG tạo order. Order sẽ được tạo khi user xác nhận đã thanh toán.
     */
    @PostMapping("/create-momo-payment-only")
    public ResponseEntity<?> createMoMoPaymentOnly(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {

        System.out.println("🔵 Create MoMo Payment Only called");
        
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
            // Tính tổng tiền từ orderDetails
            long totalAmount = 0;
            for (CreateOrderRequestDTO.OrderDetailRequest detail : request.getOrderDetails()) {
                Book book = bookService.findById(detail.getBookId()).orElse(null);
                if (book == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Book not found: " + detail.getBookId()));
                }
                double unitPrice = book.getPrice() * (100 - book.getDiscountPercent()) / 100.0;
                totalAmount += Math.round(unitPrice * detail.getQuantity());
            }
            
            // TODO: Apply discount/voucher nếu có
            
            System.out.println("💰 Calculated total: " + totalAmount + " VND");

            // Validate MoMo amount constraints
            if (totalAmount < 1000) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số tiền tối thiểu cho thanh toán MoMo là 1,000 VND"));
            }
            
            if (totalAmount > 50000000) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số tiền tối đa cho thanh toán MoMo là 50,000,000 VND"));
            }

            // Tạo orderId tạm (chưa lưu vào database)
            String tempOrderId = "TEMP_" + System.currentTimeMillis();
            
            // Tạo MoMo payment request
            String momoOrderId = tempOrderId + "_" + System.currentTimeMillis();
            String orderInfo = "Thanh toán đơn hàng " + tempOrderId;
            
            MoMoPaymentResponse momoResponse = moMoService.createPayment(momoOrderId, totalAmount, orderInfo);

            if (!momoResponse.isSuccess()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Không thể tạo thanh toán MoMo: " + momoResponse.getMessage()));
            }

            // Trả về payment data + orderRequest để frontend lưu tạm
            long expiresAt = System.currentTimeMillis() + (15 * 60 * 1000);
            
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("tempOrderId", tempOrderId);
            paymentData.put("amount", totalAmount);
            paymentData.put("qrCodeUrl", momoResponse.getQrCodeUrl());
            paymentData.put("payUrl", momoResponse.getPayUrl());
            paymentData.put("deeplink", momoResponse.getDeeplink());
            paymentData.put("expiresAt", expiresAt);
            
            Map<String, Object> response = new HashMap<>();
            response.put("payment", paymentData);
            response.put("orderRequest", request); // Trả lại để frontend lưu

            System.out.println("✅ MoMo payment created (no order yet): " + tempOrderId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    /**
     * POST /api/orders/create-vnpay-payment-only
     * Chỉ tạo VNPay payment request, KHÔNG tạo order. Order sẽ được tạo khi user xác nhận đã thanh toán.
     */
    @PostMapping("/create-vnpay-payment-only")
    public ResponseEntity<?> createVNPayPaymentOnly(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        System.out.println("🟢 Create VNPay Payment Only called");
        
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
            // Tính tổng tiền từ orderDetails
            long totalAmount = 0;
            for (CreateOrderRequestDTO.OrderDetailRequest detail : request.getOrderDetails()) {
                Book book = bookService.findById(detail.getBookId()).orElse(null);
                if (book == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Book not found: " + detail.getBookId()));
                }
                double unitPrice = book.getPrice() * (100 - book.getDiscountPercent()) / 100.0;
                totalAmount += Math.round(unitPrice * detail.getQuantity());
            }
            
            // TODO: Apply discount/voucher nếu có
            
            System.out.println("💰 Calculated total: " + totalAmount + " VND");

            // Validate VNPay amount constraints (similar to MoMo)
            if (totalAmount < 1000) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số tiền tối thiểu cho thanh toán VNPay là 1,000 VND"));
            }
            
            if (totalAmount > 50000000) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số tiền tối đa cho thanh toán VNPay là 50,000,000 VND"));
            }

            // Tạo orderId tạm (chưa lưu vào database)
            String tempOrderId = "TEMP_" + System.currentTimeMillis();
            
            // Lấy IP của client
            String clientIp = getClientIp(httpRequest);
            
            // Tạo VNPay payment URL
            String paymentUrl = vnpayService.createPaymentUrl(tempOrderId, totalAmount, clientIp);
            
            // Tạo QR code từ payment URL
            String qrCodeBase64 = qrCodeService.generateQRCodeBase64(paymentUrl, 300);

            // Trả về payment data + orderRequest để frontend lưu tạm
            long expiresAt = System.currentTimeMillis() + (15 * 60 * 1000);
            
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("tempOrderId", tempOrderId);
            paymentData.put("amount", totalAmount);
            paymentData.put("qrCodeBase64", qrCodeBase64);
            paymentData.put("paymentUrl", paymentUrl);
            paymentData.put("expiresAt", expiresAt);
            
            Map<String, Object> response = new HashMap<>();
            response.put("payment", paymentData);
            response.put("orderRequest", request); // Trả lại để frontend lưu

            System.out.println("✅ VNPay payment created (no order yet): " + tempOrderId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    /**
     * POST /api/orders/checkout-momo
     * Tạo đơn hàng mới và trả về QR Code thanh toán MoMo
     */
    @PostMapping("/checkout-momo")
    public ResponseEntity<?> checkoutWithMomo(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        System.out.println("🔵 MoMo Checkout called");
        System.out.println("   Auth Header: " + (authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "null"));
        System.out.println("   Request body: " + request);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ Missing or invalid Authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing Authorization header"));
        }

        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);
        User user = userService.findUserById(userId);

        System.out.println("   User ID: " + userId);
        System.out.println("   User: " + (user != null ? user.getEmail() : "null"));

        if (user == null) {
            System.out.println("❌ User not found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token or user not found"));
        }

        try {
            System.out.println("📦 Creating order...");
            System.out.println("   Request orderDetails count: " + request.getOrderDetails().size());
            
            // 1. Tạo đơn hàng
            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            String orderId = createdOrder.getOrderId();
            
            System.out.println("🔍 Order Details:");
            System.out.println("   Order ID: " + orderId);
            System.out.println("   Total Amount: " + createdOrder.getTotalAmount());
            System.out.println("   Order Details count: " + (createdOrder.getOrderDetails() != null ? createdOrder.getOrderDetails().size() : 0));
            if (createdOrder.getOrderDetails() != null) {
                for (OrderFullDetailDTO.OrderDetailWithBookDTO detail : createdOrder.getOrderDetails()) {
                    System.out.println("     - Book: " + detail.getBook().getTitle() + ", Qty: " + detail.getQuantity() + ", Price: " + detail.getTotalPrice());
                }
            }
            
            long totalAmount = Math.round(createdOrder.getTotalAmount());
            
            System.out.println("✅ Order created: " + orderId + ", final amount: " + totalAmount + " VND");

            // Validate MoMo amount constraints
            if (totalAmount < 1000) {
                System.out.println("❌ Amount too small for MoMo: " + totalAmount + " VND");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số tiền tối thiểu cho thanh toán MoMo là 1,000 VND. Tổng đơn hàng của bạn: " + totalAmount + " VND"));
            }
            
            if (totalAmount > 50000000) {
                System.out.println("❌ Amount too large for MoMo: " + totalAmount + " VND");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số tiền tối đa cho thanh toán MoMo là 50,000,000 VND. Tổng đơn hàng của bạn: " + totalAmount + " VND"));
            }

            // 2. Tạo payment request đến MoMo
            System.out.println("💳 Creating MoMo payment...");
            
            // Tạo unique orderId cho MoMo (thêm timestamp để tránh trùng)
            String momoOrderId = orderId + "_" + System.currentTimeMillis();
            String orderInfo = "Thanh toán đơn hàng " + orderId;
            
            MoMoPaymentResponse momoResponse = moMoService.createPayment(momoOrderId, totalAmount, orderInfo);

            System.out.println("   MoMo Order ID: " + momoOrderId);
            System.out.println("   MoMo Response: success=" + momoResponse.isSuccess() + ", message=" + momoResponse.getMessage());
            System.out.println("   QR Code URL: " + momoResponse.getQrCodeUrl());
            System.out.println("   Pay URL: " + momoResponse.getPayUrl());
            System.out.println("   Deeplink: " + momoResponse.getDeeplink());

            if (!momoResponse.isSuccess()) {
                System.out.println("❌ MoMo payment creation failed");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Không thể tạo thanh toán MoMo: " + momoResponse.getMessage()));
            }

            // 3. Thời gian hết hạn (15 phút)
            long expiresAt = System.currentTimeMillis() + (15 * 60 * 1000);

            // 4. Tạo response
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("orderId", orderId);
            paymentData.put("amount", totalAmount);
            paymentData.put("payUrl", momoResponse.getPayUrl());
            paymentData.put("qrCodeUrl", momoResponse.getQrCodeUrl());
            paymentData.put("deeplink", momoResponse.getDeeplink());
            paymentData.put("expiresAt", expiresAt);
            paymentData.put("message", "Order created successfully. Scan QR code to pay with MoMo.");

            Map<String, Object> response = new HashMap<>();
            response.put("order", createdOrder);
            response.put("payment", paymentData);

            System.out.println("✅ Order " + orderId + " created with MoMo QR code");
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
                    .body(Map.of("message", "Failed to checkout with MoMo: " + e.getMessage()));
        }
    }

}