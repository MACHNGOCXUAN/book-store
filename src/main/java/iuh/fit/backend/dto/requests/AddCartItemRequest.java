// AddCartItemRequest.java
package iuh.fit.backend.dto.requests;

public record AddCartItemRequest(
        String customerId,
        String bookId,
        int quantity
) {}
