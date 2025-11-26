package iuh.fit.backend.controller;

import java.util.HashMap;
import java.util.Map;

import iuh.fit.backend.payment.momo.MoMoPaymentResponse;
import iuh.fit.backend.payment.momo.MoMoService;
import iuh.fit.backend.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.dto.responses.PaymentQRCodeResponse;
import iuh.fit.backend.model.User;
import iuh.fit.backend.payment.vnpay.VnpayQRCodeService;
import iuh.fit.backend.payment.vnpay.VnpayService;
import iuh.fit.backend.service.BookService;
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

    /** ----------------------- FILTER ORDERS ----------------------- */
    @PostMapping()
    public ResponseEntity<?> getAllOrderFilter(
            @RequestBody OrderFilter orderFilter,
            @RequestHeader("Authorization") String authHeader) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        Page<OrderFullDetailDTO> ordersPage = orderService.getOrdersFilter(orderFilter, user);

        Map<String, Object> response = new HashMap<>();
        response.put("data", ordersPage.getContent());
        response.put("paging", Map.of(
                "curPage", ordersPage.getNumber() + 1,
                "limitPage", ordersPage.getSize(),
                "totalRows", ordersPage.getTotalElements(),
                "totalPage", ordersPage.getTotalPages()
        ));

        return ResponseEntity.ok(response);
    }

    /** ----------------------- GET ORDER BY ID ----------------------- */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /** ----------------------- UPDATE ORDER STATUS ----------------------- */
    @PutMapping("/update-status")
    public ResponseEntity<?> updateOrder(
            @RequestBody UpdateStatusOrderDTO updateStatusOrderDTO,
            @RequestHeader("Authorization") String authHeader) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        if (updateStatusOrderDTO.getOrderId() == null || updateStatusOrderDTO.getStatus() == null)
            return ResponseEntity.badRequest().body(Map.of("message", "orderId & status required"));

        return orderService.updateOrderStatus(updateStatusOrderDTO, user)
                ? ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"))
                : ResponseEntity.status(500).body(Map.of("message", "Cập nhật thất bại!"));
    }

    /** ----------------------- CANCEL ORDER ----------------------- */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable("id") String id,
            @RequestHeader("Authorization") String authHeader) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        return orderService.cancelOrder(id, user)
                ? ResponseEntity.ok(Map.of("message", "Đã hủy đơn thành công"))
                : ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn"));
    }

    /** ----------------------- CREATE ORDER (COD) ----------------------- */
    @PostMapping("/createOrder")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** ----------------------- CHECKOUT VNPay ----------------------- */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            // ⭐ Set payment method if not provided
            if (request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()) {
                request.setPaymentMethod("VNPAY");
            }
            
            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            String orderId = createdOrder.getOrderId();
            long totalAmount = Math.round(createdOrder.getTotalAmount());

            String clientIp = getClientIp(httpRequest);

            String paymentUrl = vnpayService.createPaymentUrl(orderId, totalAmount, clientIp);
            String qrCodeBase64 = qrCodeService.generateQRCodeBase64(paymentUrl);

            // ⭐ Update Payment with QR code info
            orderService.updatePaymentWithQRCode(orderId, paymentUrl, qrCodeBase64);

            PaymentQRCodeResponse paymentResponse = PaymentQRCodeResponse.builder()
                    .orderId(orderId)
                    .amount(totalAmount)
                    .paymentUrl(paymentUrl)
                    .qrCodeBase64(qrCodeBase64)
                    .expiresAt(System.currentTimeMillis() + 900_000)
                    .message("Order created successfully. Scan QR code to pay.")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of("order", createdOrder, "payment", paymentResponse)
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    /** ----------------------- CHECKOUT Momo ----------------------- */
    @PostMapping("/checkout-momo")
    public ResponseEntity<?> checkoutWithMomo(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            // ⭐ Set payment method if not provided
            if (request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()) {
                request.setPaymentMethod("MOMO");
            }
            
            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            String orderId = createdOrder.getOrderId();
            long totalAmount = Math.round(createdOrder.getTotalAmount());

            String momoOrderId = orderId + "_" + System.currentTimeMillis();
            MoMoPaymentResponse momoResponse = moMoService.createPayment(
                    momoOrderId, totalAmount, "Thanh toán đơn hàng " + orderId
            );

            if (!momoResponse.isSuccess()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "MoMo error: " + momoResponse.getMessage()));
            }

            // ⭐ Update Payment with MoMo URL
            orderService.updatePaymentWithQRCode(orderId, momoResponse.getPayUrl(), momoResponse.getQrCodeUrl());

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "order", createdOrder,
                            "payment", Map.of(
                                    "orderId", orderId,
                                    "amount", totalAmount,
                                    "payUrl", momoResponse.getPayUrl(),
                                    "qrCodeUrl", momoResponse.getQrCodeUrl(),
                                    "deeplink", momoResponse.getDeeplink(),
                                    "expiresAt", System.currentTimeMillis() + 900_000
                            )
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    /** ----------------------- CREATE MOMO PAYMENT ONLY (NO ORDER) ----------------------- */
    @PostMapping("/create-momo-payment-only")
    public ResponseEntity<?> createMoMoPaymentOnly(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            long totalAmount = 0;
            
            // Calculate total from order details
            for (CreateOrderRequestDTO.OrderDetailRequest detailRequest : request.getOrderDetails()) {
                var book = bookService.findById(detailRequest.getBookId()).orElseThrow(
                        () -> new RuntimeException("Book not found: " + detailRequest.getBookId()));
                double unitPrice = book.getPrice() * (100 - book.getDiscountPercent()) / 100.0;
                totalAmount += (long) (unitPrice * detailRequest.getQuantity());
            }

            String momoOrderId = "TEMP_" + System.currentTimeMillis();
            MoMoPaymentResponse momoResponse = moMoService.createPayment(
                    momoOrderId, totalAmount, "Thanh toán đơn hàng"
            );

            if (!momoResponse.isSuccess()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "MoMo error: " + momoResponse.getMessage()));
            }

            // ⭐ Clean up the request to avoid sending null values
            CreateOrderRequestDTO cleanedRequest = new CreateOrderRequestDTO();
            cleanedRequest.setCustomerId(request.getCustomerId());
            cleanedRequest.setOrderDetails(request.getOrderDetails());
            // Only set voucherId/discountCode if they have values
            if (request.getVoucherId() != null && !request.getVoucherId().isBlank()) {
                cleanedRequest.setVoucherId(request.getVoucherId());
            }
            if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
                cleanedRequest.setDiscountCode(request.getDiscountCode());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "payment", Map.of(
                                    "tempOrderId", momoOrderId,
                                    "amount", totalAmount,
                                    "payUrl", momoResponse.getPayUrl(),
                                    "qrCodeUrl", momoResponse.getQrCodeUrl(),
                                    "deeplink", momoResponse.getDeeplink(),
                                    "expiresAt", System.currentTimeMillis() + 900_000
                            ),
                            "orderRequest", cleanedRequest
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    /** ----------------------- CREATE VNPAY PAYMENT ONLY (NO ORDER) ----------------------- */
    @PostMapping("/create-vnpay-payment-only")
    public ResponseEntity<?> createVNPayPaymentOnly(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            long totalAmount = 0;
            
            // Calculate total from order details
            for (CreateOrderRequestDTO.OrderDetailRequest detailRequest : request.getOrderDetails()) {
                var book = bookService.findById(detailRequest.getBookId()).orElseThrow(
                        () -> new RuntimeException("Book not found: " + detailRequest.getBookId()));
                double unitPrice = book.getPrice() * (100 - book.getDiscountPercent()) / 100.0;
                totalAmount += (long) (unitPrice * detailRequest.getQuantity());
            }

            String tempOrderId = "TEMP_" + System.currentTimeMillis();
            String clientIp = getClientIp(httpRequest);

            String paymentUrl = vnpayService.createPaymentUrl(tempOrderId, totalAmount, clientIp);
            String qrCodeBase64 = qrCodeService.generateQRCodeBase64(paymentUrl);

            // ⭐ Clean up the request to avoid sending null values
            CreateOrderRequestDTO cleanedRequest = new CreateOrderRequestDTO();
            cleanedRequest.setCustomerId(request.getCustomerId());
            cleanedRequest.setOrderDetails(request.getOrderDetails());
            // Only set voucherId/discountCode if they have values
            if (request.getVoucherId() != null && !request.getVoucherId().isBlank()) {
                cleanedRequest.setVoucherId(request.getVoucherId());
            }
            if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
                cleanedRequest.setDiscountCode(request.getDiscountCode());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "payment", Map.of(
                                    "tempOrderId", tempOrderId,
                                    "amount", totalAmount,
                                    "paymentUrl", paymentUrl,
                                    "qrCodeBase64", qrCodeBase64,
                                    "expiresAt", System.currentTimeMillis() + 900_000
                            ),
                            "orderRequest", cleanedRequest
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    /** ----------------------- REORDER ----------------------- */
    @PostMapping("/{id}/reorder")
    public ResponseEntity<?> reorder(
            @PathVariable("id") String id,
            @RequestHeader("Authorization") String authHeader) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.reorderFromOrder(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** ----------------------- HELPERS ----------------------- */
    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return userService.findUserById(jwtUtils.getUserIdFromToken(token));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        return (xForwardedFor != null && !xForwardedFor.isBlank())
                ? xForwardedFor.split(",")[0]
                : request.getRemoteAddr();
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(401).body(Map.of("message", "Missing or invalid token"));
    }
}
