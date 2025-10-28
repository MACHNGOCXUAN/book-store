package iuh.fit.backend.service.impl;

import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.*;
import iuh.fit.backend.repository.OrderHistoryRepository;
import iuh.fit.backend.repository.OrderRepository;
import iuh.fit.backend.repository.PaymentRepository;
import iuh.fit.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderHistoryRepository orderHistoryRepository;

    private OrderFullDetailDTO convertToOrderFullDetailDTO(Order order) {
        OrderFullDetailDTO dto = new OrderFullDetailDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());

        // ---------------- Customer ----------------
        if (order.getCustomer() != null) {
            OrderFullDetailDTO.CustomerInfoDTO customerDTO = new OrderFullDetailDTO.CustomerInfoDTO();
            customerDTO.setUserId(order.getCustomer().getUserId());
            customerDTO.setFullName(order.getCustomer().getFullName());
            customerDTO.setPhoneNumber(order.getCustomer().getPhoneNumber());
            customerDTO.setEmail(order.getCustomer().getEmail());
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
    public Page<OrderFullDetailDTO> getOrdersFilter(OrderFilter orderFilter) {
        int page = orderFilter.getPage() != null ? orderFilter.getPage() - 1 : 0;
        int limit = orderFilter.getLimit() != null ? orderFilter.getLimit() : 10;

        Pageable pageable = PageRequest.of(page, limit, Sort.by("orderDate").descending());

        String text = orderFilter.getTextSearch();
        LocalDateTime startDate = orderFilter.getStartTime();
        LocalDateTime endDate = orderFilter.getEndTime();

        Page<Order> ordersPage = orderRepository.findByFilter(
                orderFilter.getStatus(),
                orderFilter.getStartTime(),
                orderFilter.getEndTime(),
                orderFilter.getTextSearch(),
                pageable
        );
        List<OrderFullDetailDTO> dtoList = ordersPage.getContent()
                .stream()
                .map(this::convertToOrderFullDetailDTO)
                .toList();

        // Trả về Page<OrderFullDetailDTO>
        return new PageImpl<>(dtoList, pageable, ordersPage.getTotalElements());
    }

    @Override
    public OrderFullDetailDTO getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        return convertToOrderFullDetailDTO(order);
    }

    @Override
    @Transactional
    public boolean updateOrderStatus(UpdateStatusOrderDTO updateStatusOrderDTO) {
        Order order = orderRepository.findById(updateStatusOrderDTO.getOrderId()).orElse(null);
        if (order == null) {
            return false;
        }

        order.setStatus(updateStatusOrderDTO.getStatus());
        orderRepository.save(order);

        OrderHistory orderHistory = new OrderHistory();
        orderHistory.setOrder(order);
        orderHistory.setStatus(updateStatusOrderDTO.getStatus());
        orderHistory.setTimestamp(LocalDateTime.now());

        orderHistoryRepository.save(orderHistory);

        return true;
    }
}