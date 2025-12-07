package iuh.fit.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.UserDiscountWallet;

@Repository
public interface UserDiscountWalletRepository extends JpaRepository<UserDiscountWallet, Long> {

    /**
     * Lấy tất cả voucher của user (chưa dùng)
     */
    List<UserDiscountWallet> findByCustomerAndUsedFalse(Customer customer);

    /**
     * Lấy tất cả voucher của user (cả đã dùng và chưa)
     */
    List<UserDiscountWallet> findByCustomer(Customer customer);

    /**
     * Lấy tất cả UserDiscountWallet theo userId (bao gồm đã dùng và chưa dùng)
     */
    List<UserDiscountWallet> findByCustomer_UserId(String userId);

    /**
     * Check xem user có sở hữu voucher nào không
     */
    Optional<UserDiscountWallet> findByCustomerAndDiscountCodeAndUsedFalse(Customer customer, DiscountCode discountCode);

    /**
     * Lấy số lượng voucher chưa dùng của user
     */
    long countByCustomerAndUsedFalse(Customer customer);

    /**
     * Lấy tất cả voucher của 1 discountCode (để track usage)
     */
    List<UserDiscountWallet> findByDiscountCode(DiscountCode discountCode);

    /**
     * Lấy số voucher đã dùng của discount code nào đó
     */
    long countByDiscountCodeAndUsedTrue(DiscountCode discountCode);

    /**
     * Kiểm tra tồn tại bản ghi wallet theo customer và discountCode
     */
    boolean existsByCustomerAndDiscountCode(Customer customer, DiscountCode discountCode);
}
