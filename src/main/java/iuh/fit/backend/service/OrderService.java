package iuh.fit.backend.service;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.requests.UpdateStatusOrderDTO;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.Order;
import iuh.fit.backend.model.User;
import iuh.fit.backend.model.enums.OrderStatus;
import org.springframework.data.domain.Page;

public interface OrderService {
    Page<OrderFullDetailDTO> getOrdersFilter(OrderFilter orderFilter, User user);

    OrderFullDetailDTO getOrderById(String orderId);

    boolean updateOrderStatus(UpdateStatusOrderDTO updateStatusOrderDTO, User user);

    OrderFullDetailDTO createOrder(CreateOrderRequestDTO request, User user);

    boolean cancelOrder(String orderId, User user);
}
