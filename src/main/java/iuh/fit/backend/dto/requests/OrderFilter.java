package iuh.fit.backend.dto.requests;

import iuh.fit.backend.config.OrderStatusDeserializer;
import iuh.fit.backend.model.enums.OrderStatus;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderFilter {
    private Integer page;
    private Integer limit;
    @JsonDeserialize(using = OrderStatusDeserializer.class)
    private OrderStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String textSearch;
}