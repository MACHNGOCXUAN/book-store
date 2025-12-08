package iuh.fit.backend.service.impl;

import java.time.LocalDateTime;

import iuh.fit.backend.controller.OrderController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.Book;
import iuh.fit.backend.model.Cart;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.OrderDetail;
import iuh.fit.backend.model.OrderHistory;
import iuh.fit.backend.model.Payment;
import iuh.fit.backend.model.Staff;
import iuh.fit.backend.model.User;
import iuh.fit.backend.model.enums.OrderStatus;
import iuh.fit.backend.model.enums.PaymentMethod;
import iuh.fit.backend.model.enums.Role;
import iuh.fit.backend.repository.BookRepository;
import iuh.fit.backend.repository.CartItemRepository;
import iuh.fit.backend.repository.CartRepository;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.repository.DiscountCodeRepository;
import iuh.fit.backend.repository.OrderDetailRepository;
import iuh.fit.backend.repository.OrderHistoryRepository;
import iuh.fit.backend.repository.OrderRepository;
import iuh.fit.backend.repository.PaymentRepository;
import iuh.fit.backend.repository.StaffRepository;
import iuh.fit.backend.service.OrderService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;
    private final BookRepository bookRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderDetailRepository orderDetailRepository;
    private String generateOrderId() {
        return "ORD" + System.currentTimeMillis();
    }
    /* ==========================================================
       🔹 PRIVATE HELPERS
       ========================================================== */

//    private String generateNextOrderId() {
//        String last = orderRepository.findMaxOrderId();
//        int next = 1;
//        if (last != null && last.startsWith("ORD")) {
//            next = Integer.parseInt(last.substring(3)) + 1;
//        }
//        return "ORD" + String.format("%03d", next);
//    }

    private String generateNextOrderDetailId() {
        String last = orderDetailRepository.findMaxOrderDetailId();
        int next = 1;
        if (last != null && last.startsWith("ODT")) {
            next = Integer.parseInt(last.substring(3)) + 1;
        }
        return "ODT" + String.format("%03d", next);
    }

    private String generateNextOrderHistoryId() {
        String last = orderHistoryRepository.findMaxOrderHistoryId();
        int next = 1;
        if (last != null && last.startsWith("ODH")) {
            next = Integer.parseInt(last.substring(3)) + 1;
        }
        return "ODH" + String.format("%03d", next);
    }

    /* ==========================================================
       🔹 ORDER CRUD + LOGIC
       ========================================================== */

    @Override
    public Page<OrderFullDetailDTO> getOrdersFilter(OrderFilter filter, User user) {
        int page = filter.getPage() == null ? 0 : filter.getPage() - 1;
        int limit = filter.getLimit() == null ? 10 : filter.getLimit();

        Pageable pageable = PageRequest.of(page, limit, Sort.by("orderDate").descending());

        Page<Order> ordersPage = switch (user.getRole()) {
            case ADMIN -> orderRepository.findByFilter(
                    filter.getStatus(), filter.getStartTime(), filter.getEndTime(), filter.getTextSearch(), pageable);
            case STAFF -> orderRepository.findByFilterStaff(
                    filter.getStatus(), filter.getStartTime(), filter.getEndTime(), filter.getTextSearch(),
                    user.getUserId(), pageable);
            default -> orderRepository.findByFilterCustomer(
                    filter.getStatus(), filter.getStartTime(), filter.getEndTime(), filter.getTextSearch(),
                    user.getUserId(), pageable);
        };

        return ordersPage.map(this::convertToDTO);
    }

    @Override
    public OrderFullDetailDTO getOrderById(String id) {
        Order order = orderRepository.findOrderWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return convertToDTO(order);
    }

    @Transactional
    @Override
    public boolean updateOrderStatus(UpdateStatusOrderDTO request, User user) {

        Order order = orderRepository.findById(request.getOrderId()).orElse(null);
        if (order == null) return false;

        // Set staff if needed
        if (user.getRole() == Role.STAFF || user.getRole() == Role.ADMIN) {
            Staff staff = staffRepository.findById(user.getUserId()).orElse(null);
            order.setStaff(staff);
        }

        order.setStatus(request.getStatus());
        orderRepository.save(order);

        // Add to history
        OrderHistory history = new OrderHistory();
        history.setId(generateNextOrderHistoryId());
        history.setOrder(order);
        history.setStatus(request.getStatus());

        orderHistoryRepository.save(history);
        return true;
    }

    @Transactional
    @Override
    public OrderFullDetailDTO createOrder(CreateOrderRequestDTO request, User user) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = new Order();
        order.setOrderId(generateOrderId());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setCustomer(customer);

        // Fetch discount/voucher if exists: prefer voucherId, then discountCode (validate after building items)
        DiscountCode pendingDiscountCode = null;
        if (request.getVoucherId() != null && !request.getVoucherId().isBlank()) {
            pendingDiscountCode = discountCodeRepository.findById(request.getVoucherId())
                .orElseThrow(() -> new RuntimeException("Invalid voucher/discount id"));
        } else if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            pendingDiscountCode = discountCodeRepository.findById(request.getDiscountCode())
                .orElseThrow(() -> new RuntimeException("Invalid discount code"));
        }

        // Get the next detail ID base to avoid duplicates in same transaction
        String lastDetailId = orderDetailRepository.findMaxOrderDetailId();
        int detailCounter = 1;
        if (lastDetailId != null && lastDetailId.startsWith("ODT")) {
            detailCounter = Integer.parseInt(lastDetailId.substring(3)) + 1;
        }

        // Calculate subtotal from request BEFORE creating details
        double subtotal = 0.0;
        
        // Generate order details
        for (CreateOrderRequestDTO.OrderDetailRequest detailRequest : request.getOrderDetails()) {

            Book book = bookRepository.findById(detailRequest.getBookId())
                    .orElseThrow(() -> new RuntimeException("Book not found"));

            if (book.getStock() < detailRequest.getQuantity())
                throw new RuntimeException("Not enough stock for: " + book.getTitle());

            OrderDetail detail = new OrderDetail();
            // ⭐ Use incremented counter instead of calling generateNextOrderDetailId() multiple times
            detail.setOrderDetailId("ODT" + String.format("%03d", detailCounter++));
            detail.setBook(book);
            detail.setQuantity(detailRequest.getQuantity());
            double unitPrice = book.getPrice() * (100 - book.getDiscountPercent()) / 100.0;
            detail.setUnitPrice(unitPrice);
            detail.setOrder(order); // ⭐ EXPLICITLY set order reference

            order.addOrderDetail(detail);
            
            // Calculate subtotal from calculated unitPrice
            subtotal += unitPrice * detailRequest.getQuantity();

            book.setStock(book.getStock() - detailRequest.getQuantity());
            bookRepository.save(book);
        }

        // Validate and attach discount code AFTER items are present
        if (pendingDiscountCode != null) {
            validateDiscountCode(pendingDiscountCode, order);
            order.setDiscountCode(pendingDiscountCode);
        }

        // Calculate totals BEFORE saving - discount applies to items subtotal only
        // Then add fixed shipping fee (e.g., 20,000 VND)
        final double SHIPPING_FEE = 20000.0;
        double itemsTotalWithDiscount = order.calcTotalWithDiscount();
        order.setTotalAmount(itemsTotalWithDiscount + SHIPPING_FEE);

        // Save order ONCE with all details
        Order saved = orderRepository.save(order);

        // Update discount code quantity AFTER saving order
        if (saved.getDiscountCode() != null) {
            saved.getDiscountCode().setQuantity(saved.getDiscountCode().getQuantity() - 1);
            discountCodeRepository.save(saved.getDiscountCode());
        }

        // Update cart
        Cart cart = cartRepository.findByCustomerUserId(customer.getUserId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        request.getOrderDetails().forEach(req ->
                cartItemRepository.findByCart_CartIdAndBook_BookId(cart.getCartId(), req.getBookId())
                        .ifPresent(cartItem -> {
                            int newQty = cartItem.getQuantity() - req.getQuantity();
                            if (newQty > 0) {
                                cartItem.setQuantity(newQty);
                                cartItemRepository.save(cartItem);
                            } else {
                                cart.getItems().remove(cartItem);
                                cartItemRepository.delete(cartItem);
                            }
                        })
        );

        // ⭐ Create Payment record with correct payment method
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            Payment payment = new Payment();
            payment.setPaymentId(generateNextPaymentId());
            payment.setOrder(saved);
            payment.setAmount((long) saved.getTotalAmount());
            payment.setMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
            payment.setPaymentCreatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        return convertToDTO(saved);
    }

    @Transactional
    @Override
    public boolean cancelOrder(String orderId, User user) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || order.getStatus() != OrderStatus.PENDING) return false;

        if (user.getRole() == Role.CUSTOMER &&
                !order.getCustomer().getUserId().equals(user.getUserId()))
            return false;

        order.setStatus(OrderStatus.CANCELLED);

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.STAFF) {
            order.setStaff(staffRepository.findById(user.getUserId()).orElse(null));
        }

        orderRepository.save(order);

        OrderHistory history = new OrderHistory();
        history.setId(generateNextOrderHistoryId());
        history.setOrder(order);
        history.setStatus(OrderStatus.CANCELLED);

        orderHistoryRepository.save(history);

        return true;
    }

    @Transactional
    @Override
    public OrderFullDetailDTO reorderFromOrder(String id, User user) {

        Order oldOrder = orderRepository.findOrderWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));

        if (oldOrder.getStatus() != OrderStatus.COMPLETED && oldOrder.getStatus() != OrderStatus.CANCELLED)
            throw new RuntimeException("Only completed/cancelled orders can be reordered");

        if (user.getRole() == Role.CUSTOMER &&
                !oldOrder.getCustomer().getUserId().equals(user.getUserId()))
            throw new RuntimeException("Not authorized to reorder this order");

        CreateOrderRequestDTO req = new CreateOrderRequestDTO();
        req.setCustomerId(oldOrder.getCustomer().getUserId());

        if (oldOrder.getDiscountCode() != null)
            req.setDiscountCode(oldOrder.getDiscountCode().getDiscountCodeId());

        req.setOrderDetails(
                oldOrder.getOrderDetails().stream().map(od -> {
                    CreateOrderRequestDTO.OrderDetailRequest d = new CreateOrderRequestDTO.OrderDetailRequest();
                    d.setBookId(od.getBook().getBookId());
                    d.setQuantity(od.getQuantity());
                    return d;
                }).toList()
        );

        return createOrder(req, user);
    }

    @Override
    public void savePendingPayment(String orderId, long amount, String paymentUrl, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        Payment payment = new Payment();
        payment.setPaymentId(generateNextPaymentId());
        payment.setOrder(order);
        payment.setAmount(amount);
        payment.setPaymentUrl(paymentUrl);
        payment.setMethod(PaymentMethod.valueOf(paymentMethod));
        payment.setPaymentCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    @Override
    public void updatePaymentWithQRCode(String orderId, String paymentUrl, String qrCodeBase64) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getPayments() != null && !order.getPayments().isEmpty()) {
            Payment payment = order.getPayments().get(0);
            payment.setPaymentUrl(paymentUrl);
            payment.setQrCodeBase64(qrCodeBase64);
            paymentRepository.save(payment);
        }
    }

    private String generateNextPaymentId() {
        String last = paymentRepository.findMaxPaymentId();
        int next = 1;
        if (last != null && last.startsWith("PAY")) {
            next = Integer.parseInt(last.substring(3)) + 1;
        }
        return "PAY" + String.format("%03d", next);
    }
}
