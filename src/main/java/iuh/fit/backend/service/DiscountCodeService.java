package iuh.fit.backend.service;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.dto.responses.AvailableVoucherDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface DiscountCodeService {
    List<DiscountCode> findAll();
    List<DiscountCode> filterDiscountCode(String code, DiscountType type, String description);
    DiscountCode save(DiscountCode discountCode);
    DiscountCode findById(String id);

    /* ========== New Methods for Loyalty+Tier System (Luồng C) ========== */

    /**
     * Lấy danh sách voucher có thể áp dụng cho customer
     * Lọc theo:
     * - Thời gian hợp lệ
     * - minPriceToApply
     * - quantity > 0
     * - tier phù hợp
     * - user sở hữu voucher (nếu không public)
     * 
     * @param customer khách hàng
     * @param cartTotal tổng giỏ hàng (để check minPriceToApply)
     * @return danh sách AvailableVoucherDTO
     */
    List<AvailableVoucherDTO> getAvailableVouchersForCheckout(Customer customer, double cartTotal);

    /**
     * Validate và áp dụng voucher
     * - Check điều kiện hợp lệ
     * - Giảm quantity (nếu public) hoặc mark used (nếu wallet)
     * - Tính giảm giá
     * 
     * @param customer khách hàng
     * @param voucherId mã voucher
     * @param cartTotal tổng giỏ hàng
     * @return giá trị giảm (VND)
     * @throws RuntimeException nếu không thỏa điều kiện
     */
    double applyVoucher(Customer customer, String voucherId, double cartTotal);
}
