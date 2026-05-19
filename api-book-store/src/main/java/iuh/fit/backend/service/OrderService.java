package iuh.fit.backend.service;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.User;
import iuh.fit.backend.model.enums.DiscountType;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

public interface OrderService {

    default void validateDiscountCode(DiscountCode code, Order order) {
        LocalDateTime now = LocalDateTime.now();

        if (code.getStartDate() != null && now.toLocalDate().isBefore(code.getStartDate()))
            throw new RuntimeException("Discount code not started yet");

        if (code.getEndDate() != null && now.toLocalDate().isAfter(code.getEndDate()))
            throw new RuntimeException("Discount code has expired");

        if (code.getQuantity() <= 0)
            throw new RuntimeException("Discount code is out of uses");

        if (code.getDiscountType() == DiscountType.ONE_TIME &&
                code.getOrder() != null && !code.getOrder().isEmpty())
            throw new RuntimeException("This discount code can only be used once");

        if (order.calcItemsTotal() < code.getMinPriceToApply())
            throw new RuntimeException("Order total must be at least " + code.getMinPriceToApply());
    }

    default OrderFullDetailDTO convertToDTO(Order order) {
        return new OrderFullDetailDTO(order);
    }

    Page<OrderFullDetailDTO> getOrdersFilter(OrderFilter filter, User user);

    OrderFullDetailDTO getOrderById(String id);

    @Transactional
    boolean updateOrderStatus(UpdateStatusOrderDTO request, User user);

    @Transactional
    OrderFullDetailDTO createOrder(CreateOrderRequestDTO request, User user);

    @Transactional
    boolean cancelOrder(String orderId, User user);

    @Transactional
    OrderFullDetailDTO reorderFromOrder(String id, User user);

    void savePendingPayment(String orderId, long amount, String paymentUrl, String paymentMethod);

    void updatePaymentWithQRCode(String orderId, String paymentUrl, String qrCodeBase64);
}
