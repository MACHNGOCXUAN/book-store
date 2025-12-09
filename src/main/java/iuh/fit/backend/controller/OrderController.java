package iuh.fit.backend.controller;

import java.time.LocalDateTime;
import java.util.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.backend.config.VnpayConfig;
import iuh.fit.backend.dto.requests.*;
import iuh.fit.backend.model.*;
import iuh.fit.backend.model.enums.OrderStatus;
import iuh.fit.backend.model.enums.PaymentMethod;
import iuh.fit.backend.model.enums.PaymentStatus;
import iuh.fit.backend.model.enums.SessionStatus;
import iuh.fit.backend.payment.momo.MoMoPaymentResponse;
import iuh.fit.backend.payment.momo.MoMoService;
import iuh.fit.backend.repository.*;
import iuh.fit.backend.service.*;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.dto.responses.PaymentQRCodeResponse;
import iuh.fit.backend.payment.vnpay.VnpayQRCodeService;
import iuh.fit.backend.payment.vnpay.VnpayService;
import iuh.fit.backend.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

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
    private final CheckoutSessionRepository checkoutSessionRepository;
    private final MomoService momoService;
    private final CustomerRepository customerRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final VnpayPaymentService vnpayPaymentService;
    private final CartItemRepository cartItemRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountWalletRepository userDiscountWalletRepository;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final String mailTo = "machngocxuan2004@gmail.com";

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

        boolean updated = orderService.updateOrderStatus(updateStatusOrderDTO, user);

        if (updated) {
            String status = updateStatusOrderDTO.getStatus().toString();
            if ("COMPLETED".equalsIgnoreCase(status)) {
                try {
                    Context context = new Context();

                    OrderFullDetailDTO order = orderService.getOrderById(updateStatusOrderDTO.getOrderId());

                    // Thông tin đơn hàng
                    context.setVariable("orderId", order.getOrderId());
                    context.setVariable("email", order.getCustomer().getEmail());
                    context.setVariable("phone", order.getCustomer().getPhoneNumber());
                    context.setVariable("orderDate", order.getOrderDate());

                    // Thông tin giao hàng
                    context.setVariable("receiverName", order.getCustomer().getFullName());
                    context.setVariable("shippingAddress", order.getCustomer().getAddress());
                    context.setVariable("receiverPhone", order.getCustomer().getPhoneNumber());

                    // Danh sách sách
                    context.setVariable("orderItems", order.getOrderDetails());

                    // Tổng tiền
                    context.setVariable("totalAmount", order.getTotalAmount());

                    String html = templateEngine.process("mail-template.html", context);

                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                    helper.setTo(order.getCustomer().getEmail());
                    helper.setSubject("Xác nhận đơn hàng đã được giao");
                    helper.setText(html, true);

                    Optional<Customer> customer = customerRepository.findById(order.getCustomer().getUserId());
                    customer.get().setLoyaltyPoints((int) (customer.get().getLoyaltyPoints() + order.getTotalAmount()/1000));
                    customerRepository.save(customer.get());
                    // 4. Gửi email
                    mailSender.send(message);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
        } else {
            return ResponseEntity.status(500).body(Map.of("message", "Cập nhật thất bại!"));
        }
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
        System.out.println( "HI"+  createOrder(request, authHeader));
        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        System.out.println("HI" + request);
        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            long total = 0;                   // Tổng giá sản phẩm
            long discountPercent = 0;         // % giảm giá
            long shippingFee = 20000;         // phí ship cố định

            // 🔹 Lấy voucher nếu có
            if (request.getVoucherId() != null) {
                Optional<DiscountCode> discountCode = discountCodeRepository.findById(request.getVoucherId());
                discountPercent = discountCode.map(DiscountCode::getPercent).orElse(0);
            }

            // 🔹 Loop chi tiết order
            for (CreateOrderRequestDTO.OrderDetailRequest detail : request.getOrderDetails()) {
                Optional<Book> book = bookService.findById(detail.getBookId());
                if (book.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Sách không tồn tại: " + detail.getBookId()));
                }

                Book b = book.get();

                if (b.getStock() < detail.getQuantity()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Sản phẩm '" + b.getTitle() + "' không đủ hàng. Còn " + b.getStock() + " cuốn"));
                }

                long priceAfterDiscount = (long) (b.getPrice() - (b.getPrice() * b.getDiscountPercent() / 100));
                total += priceAfterDiscount * detail.getQuantity();
            }

            // ⭐ Tính tổng tiền thanh toán
            long totalAmount = (total + shippingFee) - (total * discountPercent / 100);


            // 🔹 Tạo order
            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            String orderId = createdOrder.getOrderId();
            System.out.println("OrderId: " + orderId);

            String clientIp = getClientIp(httpRequest);

            // 🔹 Tạo URL thanh toán
            String paymentUrl = vnpayService.createPaymentUrl(orderId, totalAmount, clientIp);
            String qrCodeBase64 = qrCodeService.generateQRCodeBase64(paymentUrl);

            // 🔹 Update Payment
            orderService.updatePaymentWithQRCode(orderId, paymentUrl, qrCodeBase64);

            PaymentQRCodeResponse paymentResponse = PaymentQRCodeResponse.builder()
                    .orderId(orderId)
                    .amount(totalAmount)
                    .paymentUrl(paymentUrl)
                    .qrCodeBase64(qrCodeBase64)
                    .expiresAt(System.currentTimeMillis() + 900_000)
                    .message("Order created successfully. Scan QR code to pay.")
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("order", createdOrder, "payment", paymentResponse));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
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


    @PostMapping("/checkout-order")
    @Transactional
    public ResponseEntity<?> createCheckoutSession(
            @RequestBody OrderInfoDTO request,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);
        User user = userService.findUserById(userId);
        System.out.println("Đã vao checkout");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token"));
        }

        try {
            List<OrderInfoDTO.OrderDetailRequest> orderDetails = request.getOrderDetails();
            long total = 0;
            long discountPercent = 0;
            long shippingFee = 20000;

            // 🔹 Loop chi tiết order để tính total
            for (OrderInfoDTO.OrderDetailRequest detail : orderDetails) {
                Optional<Book> book = bookService.findById(detail.getBookId());
                if (book.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Sách không tồn tại: " + detail.getBookId()));
                }
                if (book.get().getStock() < detail.getQuantity()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Sản phẩm '" + book.get().getTitle() + "' không đủ hàng. Còn " + book.get().getStock() + " cuốn"));
                }
                long priceAfterDiscount = (long) (book.get().getPrice() - (book.get().getPrice() * book.get().getDiscountPercent() / 100));
                total += priceAfterDiscount * detail.getQuantity();
            }

            // 🔹 Lấy voucher nếu có
            if (request.getVoucherId() != null) {
                Optional<DiscountCode> discountCode = discountCodeRepository.findById(request.getVoucherId());
                discountPercent = discountCode.map(DiscountCode::getPercent).orElse(0);
            }

            // 🔹 Nếu có discountCode (text input), tìm theo code và lấy percent
            if (request.getDiscountCode() != null && discountPercent == 0) {
                // Giả sử DiscountCode có field code, hoặc tìm theo criteria khác
                // Có thể cần thêm repository method để tìm theo code
                // Tạm thời, nếu voucherId không có, cố gắng tìm theo discountCode
                // (Điều này phụ thuộc vào cấu trúc backend của bạn)
            }

            // ⭐ Tính tổng tiền thanh toán
            long totalAmount = (total + shippingFee) - (total * discountPercent / 100);

            CheckoutSession session = new CheckoutSession();
            session.setSessionId(UUID.randomUUID().toString());
            session.setCustomerId(userId);

            ObjectMapper mapper = new ObjectMapper();
            session.setOrderDetailsJson(mapper.writeValueAsString(orderDetails));
            System.out.println();
            session.setTotalAmount(totalAmount);
            session.setVoucherId(request.getVoucherId());
            session.setDiscountCode(request.getDiscountCode());
            session.setPaymentMethod(String.valueOf(request.getPaymentMethod()));
            session.setStatus(SessionStatus.PENDING);
            session.setCreatedAt(LocalDateTime.now());
            session.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // Hết hạn sau 15 phút
            if(request.getVoucherId() != null) {
                session.setDiscountCode(request.getVoucherId());
            }

            checkoutSessionRepository.save(session);

            if (totalAmount < 1000 || totalAmount > 50000000) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số tiền không hợp lệ: " + totalAmount + " VND"));
            }

            String orderInfo = "Thanh toán session " + session.getSessionId();
            String customOrderId = session.getSessionId() + "_" + System.currentTimeMillis();

            String paymentMethod = String.valueOf(request.getPaymentMethod());
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getSessionId());
            response.put("amount", totalAmount);
            response.put("expiresAt", session.getExpiresAt());

            if("MOMO".equalsIgnoreCase(paymentMethod)) {
                String momoResponse = momoService.createPaymentRequest(
                        String.valueOf(totalAmount),
                        customOrderId,
                        orderInfo
                );
                JSONObject momoJson = new JSONObject(momoResponse);
                if (momoJson.has("resultCode") && momoJson.getInt("resultCode") != 0) {
                    session.setStatus(SessionStatus.EXPIRED);
                    checkoutSessionRepository.save(session);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "MoMo error: " + momoJson.optString("message")));
                }
                session.setTransactionPaymentId(momoJson.optString("orderId"));
                checkoutSessionRepository.save(session);
                response.put("paymentUrl", momoJson.optString("payUrl"));
                response.put("message", "Checkout session created via MoMo");

            } else if ("VNPAY".equalsIgnoreCase(paymentMethod)) {
                VnpayRequest vnpayRequest = new VnpayRequest();
                vnpayRequest.setAmount(String.valueOf(totalAmount));
                checkoutSessionRepository.save(session);

                String vnpayUrl = vnpayPaymentService.createPayment(vnpayRequest, session.getSessionId());
                session.setStatus(SessionStatus.PENDING); // giữ trạng thái PENDING

                response.put("paymentUrl", vnpayUrl);
                response.put("message", "Checkout session created via VNPay");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Phương thức thanh toán không hợp lệ"));
            }
            checkoutSessionRepository.save(session);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create checkout: " + e.getMessage()));
        }
    }

    @PostMapping("/momo/callback")
    @Transactional
    public ResponseEntity<?> handleMoMoCallback(@RequestBody Map<String, Object> payload) {
        try {
            String momoOrderId = (String) payload.get("orderId");
            String resultCode = String.valueOf(payload.get("resultCode"));
            String sessionId = momoOrderId.split("_")[0];

            String signature = (String) payload.get("signature");
            if (!momoService.verifyCallback(payload, signature)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid signature"));
            }

            CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
                session.setStatus(SessionStatus.EXPIRED);
                checkoutSessionRepository.save(session);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Session expired"));
            }

            if (session.getStatus() == SessionStatus.COMPLETED) {
                return ResponseEntity.ok(Map.of("message", "Session already processed"));
            }

            if ("0".equals(resultCode)) {
                ObjectMapper mapper = new ObjectMapper();
                List<OrderInfoDTO.OrderDetailRequest> orderDetailDTOs = mapper.readValue(
                        session.getOrderDetailsJson(),
                        new TypeReference<List<OrderInfoDTO.OrderDetailRequest>>() {}
                );

                for (OrderInfoDTO.OrderDetailRequest detailDTO : orderDetailDTOs) {
                    Optional<Book> book = bookService.findById(detailDTO.getBookId());
                    if (book.isEmpty() || book.get().getStock() < detailDTO.getQuantity()) {
                        // Hoan tien
//                        momoService.refundPayment(momoOrderId, session.getTotalAmount());

                        session.setStatus(SessionStatus.EXPIRED);
                        checkoutSessionRepository.save(session);

                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "Sản phẩm đã hết hàng, tiền sẽ được hoàn lại"));
                    }
                }

                Customer customer = customerRepository.findByUserId(session.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Khong ton tai khach hang co id: " + session.getCustomerId()));


                Order order = new Order();
                order.setOrderId(generateOrderId());
                order.setCustomer(customer);
                order.setStatus(OrderStatus.PENDING);
                order.setOrderDate(LocalDateTime.now());


                String discountCodeId = session.getDiscountCode();

                DiscountCode discountCode = null;

                if (discountCodeId != null) {
                    discountCode = discountCodeRepository.findById(discountCodeId).orElse(null);
                }

                order.setDiscountCode(discountCode);

                List<OrderDetail> orderDetails = new ArrayList<>();
                for (OrderInfoDTO.OrderDetailRequest detailDTO : orderDetailDTOs) {
                    Optional<Book> book = bookService.findById(detailDTO.getBookId());

                    book.get().setStock(book.get().getStock() - detailDTO.getQuantity());
                    bookRepository.save(book.get());

                    OrderDetail detail = new OrderDetail();
                    detail.setOrderDetailId(UUID.randomUUID().toString());
                    detail.setOrder(order);
                    detail.setBook(book.get());
                    detail.setQuantity(detailDTO.getQuantity());
                    detail.setUnitPrice(book.get().getPrice());
                    orderDetails.add(detail);
                    CartItem cartItem = cartItemRepository.findByBook_BookIdAndCart_Customer_UserId(book.get().getBookId(), customer.getUserId());
                    cartItemRepository.delete(cartItem);
                }
                order.setOrderDetails(orderDetails);
                order.setTotalAmount(session.getTotalAmount());
                orderRepository.save(order);

                OrderHistory orderHistory = new OrderHistory();
                orderHistory.setTimestamp(LocalDateTime.now());
                orderHistory.setOrder(order);
                orderHistory.setStatus(OrderStatus.PENDING);
                orderHistory.setId(UUID.randomUUID().toString());

                orderHistoryRepository.save(orderHistory);

                Payment payment = new Payment();
                payment.setPaymentId(UUID.randomUUID().toString());
                payment.setOrder(order);
                payment.setMethod(PaymentMethod.valueOf(session.getPaymentMethod()));
                payment.setAmount(session.getTotalAmount());
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setTransactionId(momoOrderId);
                payment.setPaymentCreatedAt(session.getCreatedAt());
                payment.setPaymentCompletedAt(LocalDateTime.now());
                payment.setResponseCode(resultCode);
                paymentRepository.save(payment);

                // 🔹 Giảm remaining_uses của voucher từ UserDiscountWallet nếu có
                if (session.getDiscountCode() != null) {
                    DiscountCode appliedDiscountCode = discountCodeRepository.findById(session.getDiscountCode()).orElse(null);
                    if (appliedDiscountCode != null) {
                        Optional<UserDiscountWallet> walletOpt = userDiscountWalletRepository
                                .findByCustomerAndDiscountCodeAndUsedFalse(customer, appliedDiscountCode);
                        if (walletOpt.isPresent()) {
                            UserDiscountWallet wallet = walletOpt.get();
                            wallet.decrementRemainingUses();
                            if (wallet.isExhausted()) {
                                wallet.markAsUsed(order.getOrderId());
                            }
                            userDiscountWalletRepository.save(wallet);
                        }
                    }
                }

                session.setStatus(SessionStatus.COMPLETED);
                checkoutSessionRepository.save(session);

                return ResponseEntity.ok(Map.of(
                        "message", "Payment successful, order created",
                        "orderId", order.getOrderId()
                ));

            } else {
                session.setStatus(SessionStatus.EXPIRED);
                checkoutSessionRepository.save(session);

                return ResponseEntity.ok(Map.of(
                        "message", "Payment failed or cancelled",
                        "resultCode", resultCode
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process callback: " + e.getMessage()));
        }
    }

    @GetMapping("/vnpay/callback")
    @Transactional
    public ResponseEntity<?> handleVnpayCallback(@RequestParam Map<String, String> allParams, HttpServletResponse response) {
        try {
            String txnRef = allParams.get("vnp_TxnRef");
            String responseCode = allParams.get("vnp_ResponseCode");
            String vnpSecureHash = allParams.get("vnp_SecureHash");

            Map<String, String> paramsToVerify = new HashMap<>(allParams);
            paramsToVerify.remove("vnp_SecureHash");
            paramsToVerify.remove("vnp_SecureHashType");

            String calculatedHash = VnpayConfig.hashAllFields(paramsToVerify);

            if (!calculatedHash.equals(vnpSecureHash)) {
                allParams.entrySet().stream()
                        .sorted(Map.Entry.comparingByKey())
                        .forEach(entry ->
                                System.out.println("   " + entry.getKey() + " = " + entry.getValue())
                        );

                paramsToVerify.entrySet().stream()
                        .sorted(Map.Entry.comparingByKey())
                        .forEach(entry ->
                                System.out.println("   " + entry.getKey() + " = " + entry.getValue())
                        );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Chữ ký không hợp lệ"));
            }

            CheckoutSession session = checkoutSessionRepository.findById(txnRef)
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
                session.setStatus(SessionStatus.EXPIRED);
                checkoutSessionRepository.save(session);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Session expired"));
            }

            if (session.getStatus() == SessionStatus.COMPLETED) {
                return ResponseEntity.ok(Map.of("message", "Session already processed"));
            }

            if ("00".equals(responseCode)) {
                ObjectMapper mapper = new ObjectMapper();
                List<OrderInfoDTO.OrderDetailRequest> orderDetailDTOs = mapper.readValue(
                        session.getOrderDetailsJson(),
                        new TypeReference<List<OrderInfoDTO.OrderDetailRequest>>() {}
                );

                for (OrderInfoDTO.OrderDetailRequest detailDTO : orderDetailDTOs) {
                    Optional<Book> book = bookService.findById(detailDTO.getBookId());
                    if (book.isEmpty() || book.get().getStock() < detailDTO.getQuantity()) {
                        session.setStatus(SessionStatus.EXPIRED);
                        checkoutSessionRepository.save(session);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "Sản phẩm đã hết hàng"));
                    }
                }

                Customer customer = customerRepository.findByUserId(session.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Customer not found"));

                Order order = new Order();
                order.setOrderId(generateOrderId());
                order.setCustomer(customer);
                order.setStatus(OrderStatus.PENDING);
                order.setOrderDate(LocalDateTime.now());

                String discountCodeId = session.getDiscountCode();

                DiscountCode discountCode = null;

                System.out.println("ijojjl: " + discountCodeId);

                if (discountCodeId != null) {
                    discountCode = discountCodeRepository.findById(discountCodeId).orElse(null);
                }

                System.out.println("discountCode: " + discountCode);

                order.setDiscountCode(discountCode);


                List<OrderDetail> orderDetails = new ArrayList<>();
                for (OrderInfoDTO.OrderDetailRequest detailDTO : orderDetailDTOs) {
                    Book book = bookService.findById(detailDTO.getBookId()).get();
                    book.setStock(book.getStock() - detailDTO.getQuantity());
                    bookRepository.save(book);

                    OrderDetail detail = new OrderDetail();
                    detail.setOrderDetailId(UUID.randomUUID().toString());
                    detail.setOrder(order);
                    detail.setBook(book);
                    detail.setQuantity(detailDTO.getQuantity());
                    detail.setUnitPrice(book.getPrice());
                    orderDetails.add(detail);

                    CartItem cartItem = cartItemRepository.findByBook_BookIdAndCart_Customer_UserId(book.getBookId(), customer.getUserId());
                    cartItemRepository.delete(cartItem);
                }
                order.setOrderDetails(orderDetails);
                order.setTotalAmount(session.getTotalAmount());
                orderRepository.save(order);

                Payment payment = new Payment();
                payment.setPaymentId(UUID.randomUUID().toString());
                payment.setOrder(order);
                payment.setMethod(PaymentMethod.VNPAY);
                payment.setAmount(session.getTotalAmount());
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setTransactionId(allParams.get("vnp_TransactionNo"));
                payment.setPaymentCreatedAt(session.getCreatedAt());
                payment.setPaymentCompletedAt(LocalDateTime.now());
                payment.setResponseCode(responseCode);
                paymentRepository.save(payment);

                // 🔹 Giảm remaining_uses của voucher từ UserDiscountWallet nếu có
                if (session.getDiscountCode() != null) {
                    DiscountCode appliedDiscountCode = discountCodeRepository.findById(session.getDiscountCode()).orElse(null);
                    if (appliedDiscountCode != null) {
                        Optional<UserDiscountWallet> walletOpt = userDiscountWalletRepository
                                .findByCustomerAndDiscountCodeAndUsedFalse(customer, appliedDiscountCode);
                        if (walletOpt.isPresent()) {
                            UserDiscountWallet wallet = walletOpt.get();
                            wallet.decrementRemainingUses();
                            if (wallet.isExhausted()) {
                                wallet.markAsUsed(order.getOrderId());
                            }
                            userDiscountWalletRepository.save(wallet);
                        }
                    }
                }

                session.setStatus(SessionStatus.COMPLETED);
                session.setTransactionPaymentId(allParams.get("vnp_TransactionNo"));
                session.setResponseCode(responseCode);
                checkoutSessionRepository.save(session);

                response.sendRedirect("http://localhost:3001/payment-status?status=success&orderId=" + order.getOrderId());

                return ResponseEntity.ok(Map.of("message", "Payment success"));
            } else {
                session.setStatus(SessionStatus.EXPIRED);
                session.setResponseCode(responseCode);
                checkoutSessionRepository.save(session);

                response.sendRedirect("http://localhost:3001/payment-status?status=fail");

                return ResponseEntity.ok(Map.of(
                        "message", "Payment failed via VNPay",
                        "responseCode", responseCode
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process VNPay callback: " + e.getMessage()));
        }
    }


    private String generateOrderId() {
        return "ORD" + System.currentTimeMillis();
    }

}
