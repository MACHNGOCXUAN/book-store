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
    private final String mailTo = "machngocxuan2004@gmail.com"; // Consider removing if unused

    /** ----------------------- MOMO REDIRECT HANDLER ----------------------- */
    @GetMapping("/momo/redirect")
    public org.springframework.web.servlet.view.RedirectView handleMoMoRedirect(
            @RequestParam String orderId,
            @RequestParam(required = false) String resultCode,
            @RequestParam(required = false) String message) {
        try {
            System.out.println("🔍 MoMo Redirect: orderId=" + orderId + ", resultCode=" + resultCode);
            
            // Tách sessionId từ orderId (format: sessionId_timestamp)
            String sessionId = orderId.split("_")[0];
            
            // Lấy CheckoutSession để tìm real OrderId
            CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
            
            String realOrderId = session.getOrderId();
            
            if (realOrderId == null) {
                System.out.println("❌ Real orderId not found in session " + sessionId);
                return new org.springframework.web.servlet.view.RedirectView(
                    "http://localhost:3001/payment-status?orderId=ERROR&resultCode=9999");
            }
            
            System.out.println("✅ Real orderId=" + realOrderId + " (fakeOrderId was " + orderId + ")");
            
            // Redirect tới frontend với real orderId
            return new org.springframework.web.servlet.view.RedirectView(
                "http://localhost:3001/payment-status?orderId=" + realOrderId + "&resultCode=" + (resultCode != null ? resultCode : "0"));
            
        } catch (Exception e) {
            System.err.println("❌ MoMo Redirect Error: " + e.getMessage());
            e.printStackTrace();
            return new org.springframework.web.servlet.view.RedirectView(
                "http://localhost:3001/payment-status?orderId=ERROR&resultCode=9999");
        }
    }

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

    /** ----------------------- GET ORDER ID FROM SESSION ID ----------------------- */
    @GetMapping("/session/{sessionId}/order-id")
    public ResponseEntity<?> getOrderIdBySessionId(@PathVariable("sessionId") String sessionId) {
        try {
            CheckoutSession session = checkoutSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            // Nếu session đã lưu orderId, dùng cách này
            if (session.getOrderId() != null) {
                return ResponseEntity.ok(Map.of("orderId", session.getOrderId()));
            }
            
            // Nếu không, query từ Order dựa trên customerId (userId) và thời gian tạo gần nhất
            String customerId = session.getCustomerId();
            OrderStatus pendingStatus = OrderStatus.PENDING;
            
            // Query các order của customer có status PENDING được tạo gần đây nhất
            Page<Order> orders = orderRepository.findByFilterCustomer(
                    pendingStatus,
                    LocalDateTime.now().minusMinutes(20), // Lấy order được tạo trong 20 phút gần đây
                    null,
                    null,
                    customerId,
                    org.springframework.data.domain.PageRequest.of(0, 1, org.springframework.data.domain.Sort.by("orderDate").descending())
            );
            
            if (orders.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Order not found for this session"));
            }
            
            Order latestOrder = orders.getContent().get(0);
            
            // Lưu orderId vào session để lần sau nhanh hơn
            session.setOrderId(latestOrder.getOrderId());
            checkoutSessionRepository.save(session);
            
            return ResponseEntity.ok(Map.of("orderId", latestOrder.getOrderId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch order: " + e.getMessage()));
        }
    }

    /** ----------------------- GET ORDER BY ID ----------------------- */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /** ----------------------- UPDATE ORDER STATUS ----------------------- */
    @PutMapping("/update-status")
    @Transactional // Ensure transactionality for status update and loyalty points/email
    public ResponseEntity<?> updateOrder(
            @RequestBody UpdateStatusOrderDTO updateStatusOrderDTO,
            @RequestHeader("Authorization") String authHeader) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        if (updateStatusOrderDTO.getOrderId() == null || updateStatusOrderDTO.getStatus() == null)
            return ResponseEntity.badRequest().body(Map.of("message", "orderId & status required"));

        boolean updated = orderService.updateOrderStatus(updateStatusOrderDTO, user);

        if (updated) {
            if (updateStatusOrderDTO.getStatus() == OrderStatus.COMPLETED) {
                try {
                    OrderFullDetailDTO order = orderService.getOrderById(updateStatusOrderDTO.getOrderId());

                    // 1. Cập nhật Loyalty Points
                    Optional<Customer> customerOpt = customerRepository.findById(order.getCustomer().getUserId());
                    if (customerOpt.isPresent()) {
                        Customer customer = customerOpt.get();
                        // Assuming 1 point per 1000 VND
                        customer.setLoyaltyPoints((int) (customer.getLoyaltyPoints() + order.getTotalAmount() / 1000));
                        customerRepository.save(customer);
                    }

                    // 2. Gửi email
                    Context context = new Context();
                    context.setVariable("orderId", order.getOrderId());
                    context.setVariable("email", order.getCustomer().getEmail());
                    context.setVariable("phone", order.getCustomer().getPhoneNumber());
                    context.setVariable("orderDate", order.getOrderDate());
                    context.setVariable("receiverName", order.getCustomer().getFullName());
                    context.setVariable("shippingAddress", order.getCustomer().getAddress());
                    context.setVariable("receiverPhone", order.getCustomer().getPhoneNumber());
                    context.setVariable("orderItems", order.getOrderDetails());
                    context.setVariable("totalAmount", order.getTotalAmount());

                    String html = templateEngine.process("mail-template.html", context);

                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                    helper.setTo(order.getCustomer().getEmail());
                    helper.setSubject("Xác nhận đơn hàng đã được giao");
                    helper.setText(html, true);

                    mailSender.send(message);
                } catch (Exception e) {
                    System.err.println("Error sending completion email or updating loyalty points: " + e.getMessage());
                    // Log the error but continue, as the order status update was successful
                }
            }

            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Cập nhật thất bại!"));
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
        // System.out.println("HI" + createOrder(request, authHeader)); // Recursive call removed

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

    /** ----------------------- CHECKOUT VNPAY (QR GENERATION - DEPRECATED/OLD FLOW) ----------------------- */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        User user = getUserFromToken(authHeader);
        if (user == null) return unauthorized();

        try {
            long total = 0;
            long discountPercent = 0;
            long shippingFee = 20000;

            if (request.getVoucherId() != null) {
                try {
                    Long walletVoucherId = Long.parseLong(request.getVoucherId());
                    UserDiscountWallet wallet = userDiscountWalletRepository.findById(walletVoucherId).orElse(null);
                    if (wallet != null && wallet.getDiscountCode() != null) {
                        discountPercent = wallet.getDiscountCode().getPercent();
                    }
                } catch (NumberFormatException e) {
                    Optional<DiscountCode> discountCode = discountCodeRepository.findById(request.getVoucherId());
                    discountPercent = discountCode.map(DiscountCode::getPercent).orElse(0);
                }
            }

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

            long totalAmount = (total + shippingFee) - (total * discountPercent / 100);

            OrderFullDetailDTO createdOrder = orderService.createOrder(request, user);
            String orderId = createdOrder.getOrderId();
            System.out.println("OrderId: " + orderId);

            String clientIp = getClientIp(httpRequest);

            String paymentUrl = vnpayService.createPaymentUrl(orderId, totalAmount, clientIp);
            String qrCodeBase64 = qrCodeService.generateQRCodeBase64(paymentUrl);

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

    /** ----------------------- CHECKOUT SESSION (MOMO/VNPAY) ----------------------- */
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
            return unauthorized();
        }

        try {
            List<OrderInfoDTO.OrderDetailRequest> orderDetails = request.getOrderDetails();
            long total = 0;
            long discountPercent = 0;
            long shippingFee = 20000;

            // 🔹 Loop chi tiết order để tính total và kiểm tra stock
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
                try {
                    Long walletVoucherId = Long.parseLong(request.getVoucherId());
                    UserDiscountWallet wallet = userDiscountWalletRepository.findById(walletVoucherId).orElse(null);
                    if (wallet != null && wallet.getDiscountCode() != null) {
                        discountPercent = wallet.getDiscountCode().getPercent();
                    }
                } catch (NumberFormatException e) {
                    Optional<DiscountCode> discountCode = discountCodeRepository.findById(request.getVoucherId());
                    discountPercent = discountCode.map(DiscountCode::getPercent).orElse(0);
                }
            }

            // ⭐ Tính tổng tiền thanh toán
            long totalAmount = (total + shippingFee) - (total * discountPercent / 100);

            // 🔹 Tạo Checkout Session
            CheckoutSession session = new CheckoutSession();
            session.setSessionId(UUID.randomUUID().toString());
            session.setCustomerId(userId);

            ObjectMapper mapper = new ObjectMapper();
            session.setOrderDetailsJson(mapper.writeValueAsString(orderDetails));
            session.setTotalAmount(totalAmount);
            session.setVoucherId(request.getVoucherId()); // Sử dụng voucherId (Long)
            session.setDiscountCode(request.getVoucherId()); // Cập nhật lại logic setDiscountCode nếu nó lưu walletVoucherId
            session.setPaymentMethod(String.valueOf(request.getPaymentMethod()));
            session.setStatus(SessionStatus.PENDING);
            session.setCreatedAt(LocalDateTime.now());
            session.setExpiresAt(LocalDateTime.now().plusMinutes(15));

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
                        orderInfo,
                        session.getSessionId()  // Pass sessionId để lưu vào extraData
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

                String vnpayUrl = vnpayPaymentService.createPayment(vnpayRequest, session.getSessionId());
                session.setStatus(SessionStatus.PENDING);

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

    /** ----------------------- MOMO CALLBACK ----------------------- */
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

                Customer customer = customerRepository.findByUserId(session.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Customer not found with id: " + session.getCustomerId()));

                // 1. Kiểm tra lại tồn kho và chuẩn bị OrderDetails
                List<OrderDetail> orderDetails = new ArrayList<>();
                DiscountCode discountCode = null;

                for (OrderInfoDTO.OrderDetailRequest detailDTO : orderDetailDTOs) {
                    Optional<Book> bookOpt = bookService.findById(detailDTO.getBookId());

                    if (bookOpt.isEmpty() || bookOpt.get().getStock() < detailDTO.getQuantity()) {
                        // Stock check fail -> REFUND (Logic mock, cần API refund thật)
                        // momoService.refundPayment(momoOrderId, session.getTotalAmount());

                        session.setStatus(SessionStatus.EXPIRED);
                        checkoutSessionRepository.save(session);

                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "Sản phẩm đã hết hàng, tiền sẽ được hoàn lại (mock)"));
                    }

                    Book book = bookOpt.get();

                    // Cập nhật stock ngay trước khi tạo đơn
                    book.setStock(book.getStock() - detailDTO.getQuantity());
                    bookRepository.save(book);

                    // Xóa CartItem
                    CartItem cartItem = cartItemRepository.findByBook_BookIdAndCart_Customer_UserId(book.getBookId(), customer.getUserId());
                    if (cartItem != null) {
                        cartItemRepository.delete(cartItem);
                    }

                    // Tạo OrderDetail Model
                    OrderDetail detail = new OrderDetail();
                    detail.setOrderDetailId(UUID.randomUUID().toString());
                    detail.setBook(book);
                    detail.setQuantity(detailDTO.getQuantity());
                    detail.setUnitPrice(book.getPrice());
                    // Order object will be set later
                    orderDetails.add(detail);
                }

                // 2. Xử lý Voucher và DiscountCode
                String walletVoucherId = session.getDiscountCode();
                if (walletVoucherId != null) {
                    try {
                        Long voucherId = Long.parseLong(walletVoucherId);
                        UserDiscountWallet wallet = userDiscountWalletRepository.findById(voucherId).orElse(null);
                        if (wallet != null) {
                            discountCode = wallet.getDiscountCode();
                        }
                    } catch (NumberFormatException e) {
                        discountCode = discountCodeRepository.findById(walletVoucherId).orElse(null);
                    }
                }

                // 3. Tạo Order
                Order order = new Order();
                order.setOrderId(generateOrderId());
                order.setCustomer(customer);
                order.setStatus(OrderStatus.PENDING);
                order.setOrderDate(LocalDateTime.now());
                order.setDiscountCode(discountCode);
                order.setTotalAmount(session.getTotalAmount());

                // Cài đặt Order cho OrderDetails và save Order
                orderDetails.forEach(detail -> detail.setOrder(order));
                order.setOrderDetails(orderDetails);
                orderRepository.save(order);

                // 4. Lưu Order History
                OrderHistory orderHistory = new OrderHistory();
                orderHistory.setTimestamp(LocalDateTime.now());
                orderHistory.setOrder(order);
                orderHistory.setStatus(OrderStatus.PENDING);
                orderHistory.setId(UUID.randomUUID().toString());
                orderHistoryRepository.save(orderHistory);

                // 5. Lưu Payment
                Payment payment = new Payment();
                payment.setPaymentId(UUID.randomUUID().toString());
                payment.setOrder(order);
                payment.setMethod(PaymentMethod.MOMO);
                payment.setAmount(session.getTotalAmount());
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setTransactionId(String.valueOf(payload.get("transId"))); // Convert to String safely
                payment.setPaymentCreatedAt(session.getCreatedAt());
                payment.setPaymentCompletedAt(LocalDateTime.now());
                payment.setResponseCode(resultCode);
                paymentRepository.save(payment);

                // 6. Giảm lượt dùng Voucher
                updateVoucherUsage(session.getDiscountCode(), customer.getUserId(), order.getOrderId());

                // 7. Hoàn thành Session
                session.setStatus(SessionStatus.COMPLETED);
                session.setOrderId(order.getOrderId()); // Lưu orderId vào session
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
                    .body(Map.of("message", "Failed to process MoMo callback: " + e.getMessage()));
        }
    }

    /** ----------------------- VNPAY CALLBACK ----------------------- */
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

                Customer customer = customerRepository.findByUserId(session.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Customer not found"));

                // 1. Kiểm tra lại tồn kho và chuẩn bị OrderDetails
                List<OrderDetail> orderDetails = new ArrayList<>();
                DiscountCode discountCode = null;

                for (OrderInfoDTO.OrderDetailRequest detailDTO : orderDetailDTOs) {
                    Optional<Book> bookOpt = bookService.findById(detailDTO.getBookId());

                    if (bookOpt.isEmpty() || bookOpt.get().getStock() < detailDTO.getQuantity()) {
                        // Stock check fail -> Không hoàn tiền qua VNPAY ở đây, chỉ đánh dấu session expired
                        session.setStatus(SessionStatus.EXPIRED);
                        checkoutSessionRepository.save(session);
                        // Redirect to fail page
                        response.sendRedirect("http://localhost:3001/payment-status?status=fail&reason=outofstock");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "Sản phẩm đã hết hàng"));
                    }

                    Book book = bookOpt.get();

                    // Cập nhật stock ngay trước khi tạo đơn
                    book.setStock(book.getStock() - detailDTO.getQuantity());
                    bookRepository.save(book);

                    // Xóa CartItem
                    CartItem cartItem = cartItemRepository.findByBook_BookIdAndCart_Customer_UserId(book.getBookId(), customer.getUserId());
                    if (cartItem != null) {
                        cartItemRepository.delete(cartItem);
                    }

                    // Tạo OrderDetail Model
                    OrderDetail detail = new OrderDetail();
                    detail.setOrderDetailId(UUID.randomUUID().toString());
                    detail.setBook(book);
                    detail.setQuantity(detailDTO.getQuantity());
                    detail.setUnitPrice(book.getPrice());
                    // Order object will be set later
                    orderDetails.add(detail);
                }

                // 2. Xử lý Voucher và DiscountCode
                String walletVoucherId = session.getDiscountCode();
                if (walletVoucherId != null) {
                    try {
                        Long voucherId = Long.parseLong(walletVoucherId);
                        UserDiscountWallet wallet = userDiscountWalletRepository.findById(voucherId).orElse(null);
                        if (wallet != null) {
                            discountCode = wallet.getDiscountCode();
                        }
                    } catch (NumberFormatException e) {
                        discountCode = discountCodeRepository.findById(walletVoucherId).orElse(null);
                    }
                }

                // 3. Tạo Order
                Order order = new Order();
                order.setOrderId(generateOrderId());
                order.setCustomer(customer);
                order.setStatus(OrderStatus.PENDING);
                order.setOrderDate(LocalDateTime.now());
                order.setDiscountCode(discountCode);
                order.setTotalAmount(session.getTotalAmount());

                // Cài đặt Order cho OrderDetails và save Order
                orderDetails.forEach(detail -> detail.setOrder(order));
                order.setOrderDetails(orderDetails);
                orderRepository.save(order);

                // 4. Lưu Order History
                OrderHistory orderHistory = new OrderHistory();
                orderHistory.setTimestamp(LocalDateTime.now());
                orderHistory.setOrder(order);
                orderHistory.setStatus(OrderStatus.PENDING);
                orderHistory.setId(UUID.randomUUID().toString());
                orderHistoryRepository.save(orderHistory);

                // 5. Lưu Payment
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

                // 6. Giảm lượt dùng Voucher
                updateVoucherUsage(session.getDiscountCode(), customer.getUserId(), order.getOrderId());

                // 7. Hoàn thành Session
                session.setStatus(SessionStatus.COMPLETED);
                session.setTransactionPaymentId(allParams.get("vnp_TransactionNo"));
                session.setResponseCode(responseCode);
                checkoutSessionRepository.save(session);

                // 8. Redirect
                response.sendRedirect("http://localhost:3001/payment-status?status=success&orderId=" + order.getOrderId());

                return ResponseEntity.ok(Map.of("message", "Payment success"));
            } else {
                session.setStatus(SessionStatus.EXPIRED);
                session.setResponseCode(responseCode);
                checkoutSessionRepository.save(session);

                // Redirect to fail page
                response.sendRedirect("http://localhost:3001/payment-status?status=fail");

                return ResponseEntity.ok(Map.of(
                        "message", "Payment failed via VNPay",
                        "responseCode", responseCode
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            // Redirect to fail page on internal error
            try {
                response.sendRedirect("http://localhost:3001/payment-status?status=fail");
            } catch (Exception ignore) {}

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process VNPay callback: " + e.getMessage()));
        }
    }


    /** ----------------------- VOUCHER USAGE HELPER ----------------------- */
    private void updateVoucherUsage(String walletVoucherId, String customerId, String orderId) {
        if (walletVoucherId != null) {
            try {
                // 1. Giảm remaining_uses của voucher từ UserDiscountWallet
                Long voucherId = Long.parseLong(walletVoucherId);
                UserDiscountWallet wallet = userDiscountWalletRepository.findById(voucherId).orElse(null);
                if (wallet != null && wallet.getCustomer().getUserId().equals(customerId)) {
                    wallet.decrementRemainingUses();
                    if (wallet.isExhausted()) {
                        wallet.markAsUsed(orderId);
                    }

                    // 2. Giảm quantity của DiscountCode (Áp dụng cho logic DiscountCode global)
                    DiscountCode dc = wallet.getDiscountCode();
                    if (dc != null) {
                        int currentQty = dc.getQuantity();
                        if (currentQty > 0) {
                            dc.setQuantity(currentQty - 1);
                            discountCodeRepository.save(dc);
                        }
                    }

                    userDiscountWalletRepository.save(wallet);
                }
            } catch (NumberFormatException e) {
                // Backward compatibility: Nếu không parse được thành Long (thường là discountCodeId/text code)
                DiscountCode appliedDiscountCode = discountCodeRepository.findById(walletVoucherId).orElse(null);
                if (appliedDiscountCode != null) {
                    int currentQty = appliedDiscountCode.getQuantity();
                    if (currentQty > 0) {
                        appliedDiscountCode.setQuantity(currentQty - 1);
                        discountCodeRepository.save(appliedDiscountCode);
                    }
                }
            }
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

    // Implemented missing method body
    private String generateOrderId() {
        // Simple implementation, consider using a more robust ID generator in a real system
        return "ORD" + System.currentTimeMillis() + (int)(Math.random() * 100);
    }
}