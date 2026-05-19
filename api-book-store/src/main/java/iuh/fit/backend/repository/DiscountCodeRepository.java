package iuh.fit.backend.repository;

import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.model.enums.CustomerTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, String> {
    List<DiscountCode> findByDiscountCodeId(String discountCodeId);

    List<DiscountCode> findByNameContaining(String name);

    List<DiscountCode> findByNameContainingAndDiscountType(String name, DiscountType discountCodeType);

    List<DiscountCode> findByDiscountType(DiscountType discountType);

    List<DiscountCode> findByDescriptionContaining(String description);

    List<DiscountCode> findByDiscountTypeAndDescriptionContaining(DiscountType discountType, String description);

    List<DiscountCode> findByNameContainingAndDescriptionContaining(String name, String description);

    List<DiscountCode> findByNameContainingAndDiscountTypeAndDescriptionContaining(String name, DiscountType discountType, String description);

    /* ========== New Methods for Loyalty System ========== */

    /**
     * Lấy tất cả voucher có thể đổi bằng điểm (redeemable=true)
     */
    List<DiscountCode> findByRedeemableTrue();

    /**
     * Lấy voucher public
     */
    List<DiscountCode> findByIsPublicTrue();

    /**
     * Lấy voucher dành cho tier cụ thể
     */
    List<DiscountCode> findByMinTierRequired(CustomerTier tier);
}
