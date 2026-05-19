package iuh.fit.backend.service;

import iuh.fit.backend.model.CartItem;

import java.util.List;

public interface CartItemService {
    List<CartItem> getAll();
    List<CartItem> getByCartId(String cartId);
    CartItem save(CartItem ci);
}
