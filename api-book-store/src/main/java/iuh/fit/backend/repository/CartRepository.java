package iuh.fit.backend.repository;

import iuh.fit.backend.model.Cart;
import iuh.fit.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    Optional<Cart> findByCustomerUserId(String customerUserId);
    @Query("SELECT MAX(c.cartId) FROM Cart c")
    String findMaxCartId();
}
