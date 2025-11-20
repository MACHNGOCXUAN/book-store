package iuh.fit.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.Address;
import iuh.fit.backend.model.Book;
import iuh.fit.backend.model.Cart;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.OrderDetail;
import iuh.fit.backend.model.OrderHistory;
import iuh.fit.backend.model.Staff;
import iuh.fit.backend.model.User;
import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.model.enums.OrderStatus;
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

    private OrderFullDetailDTO convertToOrderFullDetailDTO(Order order) {
        OrderFullDetailDTO dto = new OrderFullDetailDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());

        // ---------------- Discount Code ----------------
        if (order.getDiscountCode() != null) {
            OrderFullDetailDTO.DiscountInfoDTO discountDTO = new OrderFullDetailDTO.DiscountInfoDTO();
            discountDTO.setDiscountCodeId(order.getDiscountCode().getDiscountCodeId());
            discountDTO.setName(order.getDiscountCode().getName());
            discountDTO.setPercent((float) order.getDiscountCode().getPercent());

            // Calculate discount amount from subtotal
            double subtotal = order.calcItemsTotal();
            int discountPercent = order.getDiscountCode().getPercent();
            double discountAmount = (subtotal * discountPercent) / 100.0;

            discountDTO.setDiscountAmount(discountAmount);
            dto.setDiscountCode(discountDTO);
        }

        // ---------------- Customer ----------------
        if (order.getCustomer() != null) {
            OrderFullDetailDTO.CustomerInfoDTO customerDTO = new OrderFullDetailDTO.CustomerInfoDTO();
            customerDTO.setUserId(order.getCustomer().getUserId());
            customerDTO.setFullName(order.getCustomer().getFullName());
            // prefer receiver phone from main address if available, otherwise use
            // customer's phone
            customerDTO.setPhoneNumber(order.getCustomer().getPhoneNumber());
            customerDTO.setEmail(order.getCustomer().getEmail());

            // Build delivery address: choose main address (main == 1) when present,
            // otherwise first address
            List<Address> addresses = order.getCustomer().getAddresses();
            if (addresses != null && !addresses.isEmpty()) {
                Address chosen = addresses.stream().filter(a -> a.getMain() == 1).findFirst().orElse(addresses.get(0));
                StringBuilder addr = new StringBuilder();
                if (chosen.getSpecifics() != null && !chosen.getSpecifics().isBlank()) {
                    addr.append(chosen.getSpecifics());
                }
                if (chosen.getWard() != null && !chosen.getWard().isBlank()) {
                    if (addr.length() > 0) {
                        addr.append(", ");
                    }
                    addr.append(chosen.getWard());
                }
                if (chosen.getDistrict() != null && !chosen.getDistrict().isBlank()) {
                    if (addr.length() > 0) {
                        addr.append(", ");
                    }
                    addr.append(chosen.getDistrict());
                }
                if (chosen.getProvince() != null && !chosen.getProvince().isBlank()) {
                    if (addr.length() > 0) {
                        addr.append(", ");
                    }
                    addr.append(chosen.getProvince());
                }

                customerDTO.setAddress(addr.toString());

                // If address has receiverPhone, prefer it as contact
                if (chosen.getReceiverPhone() != null && !chosen.getReceiverPhone().isBlank()) {
                    customerDTO.setPhoneNumber(chosen.getReceiverPhone());
                }
            }

            dto.setCustomer(customerDTO);
        }

        // ---------------- Payments ----------------
        if (order.getPayments() != null && !order.getPayments().isEmpty()) {
            List<OrderFullDetailDTO.PaymentInfoDTO> paymentDTOs = order.getPayments().stream()
                    .map(p -> {
                        OrderFullDetailDTO.PaymentInfoDTO pd = new OrderFullDetailDTO.PaymentInfoDTO();
                        pd.setPaymentId(p.getPaymentId());
                        pd.setAmount(p.getAmount());
                        pd.setMethod(p.getMethod());
                        return pd;
                    }).toList();
            dto.setPayments(paymentDTOs);
        }

        if (order.getOrderHistories() != null && !order.getOrderHistories().isEmpty()) {
            List<OrderFullDetailDTO.OrderHistoryDTO> historyDTOS = order.getOrderHistories().stream()
                    .sorted((h1, h2) -> h2.getTimestamp().compareTo(h1.getTimestamp()))
                    .map(orderHistory -> {
                        OrderFullDetailDTO.OrderHistoryDTO historyDTO = new OrderFullDetailDTO.OrderHistoryDTO();
                        historyDTO.setId(orderHistory.getId());
                        historyDTO.setOrderId(orderHistory.getOrder().getOrderId());
                        historyDTO.setTimestamp(orderHistory.getTimestamp());
                        historyDTO.setStatus(orderHistory.getStatus());
                        return historyDTO;
                    }).toList();
            dto.setOrderHistories(historyDTOS);
        }

        // ---------------- Order Details ----------------
        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            List<OrderFullDetailDTO.OrderDetailWithBookDTO> orderDetailDTOs = order.getOrderDetails().stream()
                    .map(od -> {
                        OrderFullDetailDTO.OrderDetailWithBookDTO oddto = new OrderFullDetailDTO.OrderDetailWithBookDTO();
                        oddto.setOrderDetailId(od.getOrderDetailId());
                        oddto.setQuantity(od.getQuantity());
                        oddto.setUnitPrice(od.getUnitPrice());
                        oddto.setTotalPrice(od.getUnitPrice() * od.getQuantity());

                        // Book info
                        if (od.getBook() != null) {
                            OrderFullDetailDTO.BookInfoDTO bookDTO = getBookInfoDTO(od);
                            oddto.setBook(bookDTO);
                        }

                        return oddto;
                    }).toList();
            dto.setOrderDetails(orderDetailDTOs);
        }

        return dto;
    }

    private static OrderFullDetailDTO.BookInfoDTO getBookInfoDTO(OrderDetail od) {
        OrderFullDetailDTO.BookInfoDTO bookDTO = new OrderFullDetailDTO.BookInfoDTO();
        bookDTO.setBookId(od.getBook().getBookId());
        bookDTO.setTitle(od.getBook().getTitle());
        bookDTO.setAuthor(od.getBook().getAuthor());
        bookDTO.setPublisher(od.getBook().getPublisher());
        bookDTO.setPrice(od.getBook().getPrice());
        bookDTO.setCategory(od.getBook().getCategory().getCategoryId());
        bookDTO.setCoverImage(od.getBook().getCoverImage());
        return bookDTO;
    }

    @Override
    public Page<OrderFullDetailDTO> getOrdersFilter(OrderFilter orderFilter, User user) {
        int page = orderFilter.getPage() != null ? orderFilter.getPage() - 1 : 0;
        int limit = orderFilter.getLimit() != null ? orderFilter.getLimit() : 10;

        Pageable pageable = PageRequest.of(page, limit, Sort.by("orderDate").descending());

        String text = orderFilter.getTextSearch();
        LocalDateTime startDate = orderFilter.getStartTime();
        LocalDateTime endDate = orderFilter.getEndTime();

        Page<Order> ordersPage;

        if (user.getRole() == Role.ADMIN) {
            ordersPage = orderRepository.findByFilter(
                    orderFilter.getStatus(),
                    orderFilter.getStartTime(),
                    orderFilter.getEndTime(),
                    orderFilter.getTextSearch(),
                    pageable);
        } else if (user.getRole() == Role.STAFF) {
            ordersPage = orderRepository.findByFilterStaff(
                    orderFilter.getStatus(),
                    orderFilter.getStartTime(),
                    orderFilter.getEndTime(),
                    orderFilter.getTextSearch(),
                    user.getUserId(),
                    pageable);
        } else {
            // CUSTOMER - lấy orders của customer này
            ordersPage = orderRepository.findByFilterCustomer(
                    orderFilter.getStatus(),
                    orderFilter.getStartTime(),
                    orderFilter.getEndTime(),
                    orderFilter.getTextSearch(),
                    user.getUserId(),
                    pageable);
        }

        List<OrderFullDetailDTO> dtoList = ordersPage.getContent()
                .stream()
                .map(this::convertToOrderFullDetailDTO)
                .toList();

        // Trả về Page<OrderFullDetailDTO>
        return new PageImpl<>(dtoList, pageable, ordersPage.getTotalElements());
    }

    @Override
    public OrderFullDetailDTO getOrderById(String orderId) {
        Order order = orderRepository.findOrderWithDetails(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        return convertToOrderFullDetailDTO(order);
    }

    private String generateNextOrderHistoryId() {
        String last = orderHistoryRepository.findMaxOrderHistoryId();
        int next = 1;
        if (last != null && !last.isBlank() && last.startsWith("ODH")) {
            try {
                next = Integer.parseInt(last.substring(3)) + 1;
            } catch (NumberFormatException ignored) {
            }
        }
        return "ODH" + String.format("%03d", next);
    }

    @Override
    @Transactional
    public boolean updateOrderStatus(UpdateStatusOrderDTO updateStatusOrderDTO, User user) {
        Order order = orderRepository.findById(updateStatusOrderDTO.getOrderId()).orElse(null);
        if (order == null) {
            return false;
        }

        Staff staff = staffRepository.findById(user.getUserId()).orElse(null);
        order.setStaff(staff);
        order.setStatus(updateStatusOrderDTO.getStatus());
        orderRepository.save(order);

        OrderHistory orderHistory = new OrderHistory();
        orderHistory.setId(generateNextOrderHistoryId());
        orderHistory.setOrder(order);
        orderHistory.setStatus(updateStatusOrderDTO.getStatus());
        // timestamp is handled by @CreationTimestamp

        orderHistoryRepository.save(orderHistory);

        return true;
    }

    // TẠO ORDER CHO METHOD COD (THANH TOÁN KHI NHẬN HÀNG), BỔ SUNG CÁC METHOD
    // VNPAY,MOMO SAU NÀY
    @Override
    @Transactional
    public OrderFullDetailDTO createOrder(CreateOrderRequestDTO request, User user) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // TẠO ORDER
        String lastOrderId = orderRepository.findMaxOrderId();
        int nextOrderNum = 1;
        if (lastOrderId != null && !lastOrderId.isBlank() && lastOrderId.startsWith("ORD")) {
            try {
                nextOrderNum = Integer.parseInt(lastOrderId.substring(3)) + 1;
            } catch (NumberFormatException ignored) {

            }
        }
        String orderId = "ORD" + String.format("%03d", nextOrderNum);

        Order order = new Order();
        order.setOrderId(orderId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setCustomer(customer);

        // Handle discount code (từ discountCode text)
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            DiscountCode discountCode = discountCodeRepository.findById(request.getDiscountCode())
                    .orElseThrow(() -> new RuntimeException("Invalid discount code"));
            validateDiscountCode(discountCode, order);
            order.setDiscountCode(discountCode);
        }

        // Handle voucher từ wallet (voucherId)
        if (request.getVoucherId() != null && !request.getVoucherId().isBlank()) {
            DiscountCode voucherCode = discountCodeRepository.findById(request.getVoucherId())
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));
            validateDiscountCode(voucherCode, order);
            order.setDiscountCode(voucherCode);
        }

        // TẠO CÁC ORDER DETAILS
        String lastDetailId = orderDetailRepository.findMaxOrderDetailId();
        int nextDetailNum = 1;
        if (lastDetailId != null && !lastDetailId.isBlank() && lastDetailId.startsWith("ODT")) {
            try {
                nextDetailNum = Integer.parseInt(lastDetailId.substring(3)) + 1;
            } catch (NumberFormatException ignored) {
            }
        }

        for (CreateOrderRequestDTO.OrderDetailRequest detailReq : request.getOrderDetails()) {
            Book book = bookRepository.findById(detailReq.getBookId())
                    .orElseThrow(() -> new RuntimeException("Book not found with ID: " + detailReq.getBookId()));

            if (book.getStock() < detailReq.getQuantity()) {
                throw new RuntimeException("Sách \"" + book.getTitle() + "\" không đủ số lượng. "
                        + "Kho: " + book.getStock() + ", Yêu cầu: " + detailReq.getQuantity());
            }

            String orderDetailId = "ODT" + String.format("%03d", nextDetailNum);
            nextDetailNum++;

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrderDetailId(orderDetailId);
            orderDetail.setBook(book);
            orderDetail.setQuantity(detailReq.getQuantity());
            orderDetail.setUnitPrice(book.getPrice() * (100 - book.getDiscountPercent()) / 100.0);

            order.addOrderDetail(orderDetail);

            book.setStock(book.getStock() - detailReq.getQuantity());
            bookRepository.save(book);
        }

        // LƯU ORDER (orderDetails cascade)
        Order savedOrder = orderRepository.save(order);

        // TÍNH TOTAL SAU KHI SAVE (lúc này orderDetails đã được persist)
        if (savedOrder.getDiscountCode() != null) {
            // Có discount, gọi method tính với discount
            savedOrder.setTotalAmountWithDiscount();
        } else {
            // Không có discount, tính từ items
            savedOrder.recalcTotals();
        }

        if (savedOrder.getDiscountCode() != null) {
            DiscountCode code = savedOrder.getDiscountCode();
            code.setQuantity(code.getQuantity() - 1);
            discountCodeRepository.save(code);
        }

        // LƯU LẠI ORDER với totalAmount đã tính đúng
        savedOrder = orderRepository.save(savedOrder);

        // CẬP NHẬT GIỎ HÀNG
        Cart cart = cartRepository.findByCustomerUserId(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        for (CreateOrderRequestDTO.OrderDetailRequest detail : request.getOrderDetails()) {
            String bookId = detail.getBookId();
            int orderedQty = detail.getQuantity();

            cartItemRepository.findByCart_CartIdAndBook_BookId(cart.getCartId(), bookId)
                    .ifPresent(cartItem -> {
                        int newQty = cartItem.getQuantity() - orderedQty;
                        if (newQty > 0) {
                            cartItem.setQuantity(newQty);
                            cartItemRepository.save(cartItem);
                        } else {
                            cart.getItems().remove(cartItem);
                            cartItemRepository.delete(cartItem);
                        }
                    });
        }

        return convertToOrderFullDetailDTO(savedOrder);
    }

    private void validateDiscountCode(DiscountCode code, Order order) {
        LocalDateTime now = LocalDateTime.now();
        if (code.getStartDate() != null && now.toLocalDate().isBefore(code.getStartDate())) {
            throw new RuntimeException("Discount code not started yet");
        }
        if (code.getEndDate() != null && now.toLocalDate().isAfter(code.getEndDate())) {
            throw new RuntimeException("Discount code has expired");
        }
        if (code.getQuantity() <= 0) {
            throw new RuntimeException("Discount code is out of uses");
        }
        if (code.getDiscountType() == DiscountType.ONE_TIME && code.getOrder() != null && !code.getOrder().isEmpty()) {
            throw new RuntimeException("This discount code can only be used once");
        }
        if (order.calcItemsTotal() < code.getMinPriceToApply()) {
            throw new RuntimeException("Order total must be at least " + code.getMinPriceToApply());
        }
    }

    @Override
    @Transactional
    public boolean cancelOrder(String orderId, User user) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return false;
        }

        // Only allow cancel when order is PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            return false;
        }

        // If user is CUSTOMER, they can only cancel their own orders
        if (user.getRole() == Role.CUSTOMER) {
            if (!order.getCustomer().getUserId().equals(user.getUserId())) {
                return false;
            }
        }

        // Set status to CANCELLED and set staff if action by staff/admin
        order.setStatus(OrderStatus.CANCELLED);
        if (user.getRole() == Role.STAFF || user.getRole() == Role.ADMIN) {
            Staff s = staffRepository.findById(user.getUserId()).orElse(null);
            order.setStaff(s);
        }

        orderRepository.save(order);

        // Add order history entry
        OrderHistory h = new OrderHistory();
        h.setId(generateNextOrderHistoryId());
        h.setOrder(order);
        h.setStatus(OrderStatus.CANCELLED);
        // timestamp handled by @CreationTimestamp
        orderHistoryRepository.save(h);

        return true;
    }

    @Override
    @Transactional
    public OrderFullDetailDTO reorderFromOrder(String existingOrderId, User user) {
        Order existing = orderRepository.findOrderWithDetails(existingOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + existingOrderId));

        // Only allow reorder if existing order is COMPLETED or CANCELLED
        if (existing.getStatus() != OrderStatus.COMPLETED && existing.getStatus() != OrderStatus.CANCELLED) {
            throw new RuntimeException("Only completed or cancelled orders can be reordered");
        }

        // If user is CUSTOMER, ensure they are the owner
        if (user.getRole() == Role.CUSTOMER) {
            if (!existing.getCustomer().getUserId().equals(user.getUserId())) {
                throw new RuntimeException("You can only reorder your own orders");
            }
        }

        // Build CreateOrderRequestDTO from existing orderDetails
        CreateOrderRequestDTO req = new CreateOrderRequestDTO();
        req.setCustomerId(existing.getCustomer().getUserId());
        req.setDiscountCode(existing.getDiscountCode() != null ? existing.getDiscountCode().getDiscountCodeId() : null);

        List<CreateOrderRequestDTO.OrderDetailRequest> details = existing.getOrderDetails().stream().map(od -> {
            CreateOrderRequestDTO.OrderDetailRequest d = new CreateOrderRequestDTO.OrderDetailRequest();
            d.setBookId(od.getBook().getBookId());
            d.setQuantity(od.getQuantity());
            return d;
        }).toList();

        req.setOrderDetails(details);

        // Use existing createOrder logic (it will check stock, discount, update cart
        // etc.)
        return createOrder(req, user);
    }

}
