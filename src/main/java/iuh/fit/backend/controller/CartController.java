package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.AddCartItemRequest;
import iuh.fit.backend.model.Cart;
import iuh.fit.backend.model.CartItem;
import iuh.fit.backend.service.CartItemService;
import iuh.fit.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import iuh.fit.backend.security.CustomUserDetail;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemService cartItemService;
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getListCartItem(){
        return ResponseEntity.ok(cartItemService.getAll());
    }

    // Thêm/cập nhật item trong giỏ
    @PostMapping
    public ResponseEntity<CartItem> saveCartItemToCart(@RequestBody AddCartItemRequest req){
        Cart cart = cartService.addItemToCart(req.customerId(), req.bookId(), req.quantity());

        // Lấy item tương ứng sau khi add/update để trả về
        CartItem item = cartService.getCartItem(cart.getCartId(), req.bookId());
        if (item == null) {
            // Trường hợp xóa vì quantity <=0, mình trả 204
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity
                .created(URI.create("/api/cart/" + cart.getCartId() + "/items/" + item.getCartItemId()))
                .body(item);
    }

    // Xóa item theo cartItemId
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable String cartItemId) {
        cartService.removeItem(cartItemId);
        return ResponseEntity.noContent().build();
    }

    // Lấy giỏ hàng của user hiện tại (dựa trên token)
    @GetMapping("/me")
    public ResponseEntity<Cart> getMyCart(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetail)) {
            return ResponseEntity.ok(null);
        }
        CustomUserDetail cud = (CustomUserDetail) authentication.getPrincipal();
        Cart cart = cartService.getOrCreateCartForCustomer(cud.getUserId());
        return ResponseEntity.ok(cart);
    }

    // Lấy item theo cartId
    @GetMapping("/{cartId}/items")
    public ResponseEntity<List<CartItem>> getItemsByCart(@PathVariable String cartId) {
        return ResponseEntity.ok(cartItemService.getByCartId(cartId));
    }
}
