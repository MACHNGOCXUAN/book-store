package iuh.fit.backend.repository;

import iuh.fit.backend.model.UserDiscountWallet;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
}
