package iuh.fit.backend.service;

import iuh.fit.backend.dto.requests.OrderFilter;
import iuh.fit.backend.dto.responses.OrderFullDetailDTO;
import iuh.fit.backend.model.Order;
import org.springframework.data.domain.Page;

public interface OrderService {
    Page<OrderFullDetailDTO> getOrdersFilter(OrderFilter orderFilter);
    OrderFullDetailDTO getOrderById(String orderId);
}
