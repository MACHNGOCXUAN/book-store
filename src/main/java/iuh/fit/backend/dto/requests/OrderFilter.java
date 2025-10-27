package iuh.fit.backend.dto.requests;

import iuh.fit.backend.model.enums.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderFilter {
    private Integer page;
    private Integer limit;
}