package iuh.fit.backend.service;

import iuh.fit.backend.dto.requests.CreateOrderRequestDTO;
import iuh.fit.backend.model.Cart;
import iuh.fit.backend.model.CartItem;

import java.util.List;

public interface CartService {
    Cart getOrCreateCartForCustomer(String customerId);
    Cart addItemToCart(String customerId, String bookId, int quantity); // quantity >0: add/increase, <=0: remove
    CartItem getCartItem(String cartId, String bookId);
    Cart removeItem(String cartItemId);
}
