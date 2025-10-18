package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.CartItem;
import iuh.fit.backend.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemServiceImpl implements iuh.fit.backend.service.CartItemService {
    private final CartItemRepository cartItemRepository;

    @Override
    public List<CartItem> getAll(){
        return cartItemRepository.findAll();
    }

    @Override
    public CartItem save(CartItem ci) {
        return cartItemRepository.save(ci);
    }

    @Override
    public List<CartItem> getByCartId(String cartId) {
        return cartItemRepository.findByCart_CartId(cartId);
    }

    
}
