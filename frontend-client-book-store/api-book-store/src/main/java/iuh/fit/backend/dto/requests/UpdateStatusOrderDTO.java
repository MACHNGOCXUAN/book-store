package iuh.fit.backend.dto.requests;

import iuh.fit.backend.model.enums.OrderStatus;
import lombok.Data;

@Data
public class UpdateStatusOrderDTO {
    private String orderId;
    private OrderStatus status;
}
