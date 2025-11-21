// CartServiceImpl.java (hoàn thiện)
package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.model.Cart;
import iuh.fit.backend.model.CartItem;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.repository.BookRepository;
import iuh.fit.backend.repository.CartItemRepository;
import iuh.fit.backend.repository.CartRepository;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public Cart getOrCreateCartForCustomer(String customerId) {
        // Tồn tại customer?
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        // Có cart chưa?
        return cartRepository.findByCustomerUserId(customerId)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    // phát sinh cartId thủ công
                    String lastId = cartRepository.findMaxCartId();
                    int nextNum = 1;
                    if (lastId != null && lastId.startsWith("CART")) {
                        try { nextNum = Integer.parseInt(lastId.substring(4)) + 1; } catch (NumberFormatException ignored) {}
                    }
                    c.setCartId("CART" + String.format("%03d", nextNum));
                    c.setCustomer(customer);
                    c.setCreatedDate(LocalDate.now());
                    c.setTotalAmount(0);
                    return cartRepository.save(c);
                });
    }

    @Override
    @Transactional
    public Cart addItemToCart(String customerId, String bookId, int quantity) {
        if (quantity == 0) {
            // Không làm gì cả
            return getOrCreateCartForCustomer(customerId);
        }

        Cart cart = getOrCreateCartForCustomer(customerId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        Optional<CartItem> existingOpt =
                cartItemRepository.findByCart_CartIdAndBook_BookId(cart.getCartId(), bookId);

        if (quantity > 0) {
            if (existingOpt.isPresent()) {
                // tăng số lượng
                CartItem it = existingOpt.get();
                it.setQuantity(it.getQuantity() + quantity);
                // unitPrice giữ nguyên giá tại thời điểm thêm lần đầu (hoặc cập nhật theo book.getPrice nếu bạn muốn)
                cartItemRepository.save(it);
            } else {
                // tạo mới
                CartItem it = new CartItem();
                String lastId = cartItemRepository.findMaxCartItemId();
                int nextNum = 1;
                if (lastId != null && lastId.startsWith("CART_I")) {
                    try {
                        nextNum = Integer.parseInt(lastId.substring(6)) + 1; // "CART_I" = 6 ký tự
                    } catch (NumberFormatException e) {
                        nextNum = 1;
                    }
                }
                String newId = "CART_I" + String.format("%03d", nextNum);
                it.setCartItemId(newId);
                it.setCart(cart);
                it.setBook(book);
                it.setQuantity(quantity);
                it.setUnitPrice(book.getPrice() * (1 - (book.getDiscountPercent() / 100.0))); // cần field price trong Book
                cart.addItem(it); // helper của Cart sẽ set cart & recalc
                cartItemRepository.save(it); // lưu item trước
            }
        } else { // quantity < 0: coi như giảm số lượng, nếu <=0 thì xóa
            if (existingOpt.isPresent()) {
                CartItem it = existingOpt.get();
                int newQty = it.getQuantity() + quantity; // quantity âm
                if (newQty > 0) {
                    it.setQuantity(newQty);
                    cartItemRepository.save(it);
                } else {
                    // remove
                    cart.removeItem(it);
                    cartItemRepository.delete(it);
                }
            }
        }

        cart.recalcTotals();
        return cartRepository.save(cart);
    }

    @Override
    @Transactional(readOnly = true)
    public CartItem getCartItem(String cartId, String bookId) {
        return cartItemRepository.findByCart_CartIdAndBook_BookId(cartId, bookId)
                .orElse(null);
    }

    @Override
    @Transactional
    public Cart removeItem(String cartItemId) {
        CartItem it = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("CartItem not found: " + cartItemId));
        Cart c = it.getCart();
        c.removeItem(it);
        cartItemRepository.delete(it);
        c.recalcTotals();
        return cartRepository.save(c);
    }
}
