package iuh.fit.backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import iuh.fit.backend.model.enums.OrderStatus;

import java.io.IOException;

public class OrderStatusDeserializer extends JsonDeserializer<OrderStatus> {
    @Override
    public OrderStatus deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();

        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return OrderStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Log hoặc trả về default value
            return null;
        }
    }
}
