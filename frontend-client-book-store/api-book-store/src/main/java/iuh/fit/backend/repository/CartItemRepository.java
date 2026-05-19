package iuh.fit.backend.repository;

import iuh.fit.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    Optional<CartItem> findByCart_CartIdAndBook_BookId(String cartId, String bookId);
    List<CartItem> findByCart_CartId(String cartId);
    @Query("SELECT MAX(c.cartItemId) from CartItem c")
    String findMaxCartItemId();
    CartItem findByBook_BookIdAndCart_Customer_UserId(String bookId, String userId);
}
