package iuh.fit.backend.service;

import java.util.List;

import iuh.fit.backend.dto.responses.AvailableVoucherDTO;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.enums.DiscountType;

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

    /**
     * Phân phối voucher tới các user đủ điều kiện và thêm vào bảng UserDiscountWallet.
     * Điều kiện:
     * - Nếu voucher isPublic=true: phân phối cho tất cả khách hàng đang hoạt động, có tier đáp ứng nếu có minTierRequired.
     * - Nếu minTierRequired=NEW_USER: chỉ phân phối cho khách hàng đăng ký trong vòng 3 tháng gần đây.
     * - Tránh tạo trùng: không tạo nếu đã có bản ghi wallet cho customer + discountCode.
     *
     * @param discountCode voucher vừa tạo/cập nhật
     * @return số lượng bản ghi wallet đã thêm
     */
    int distributeVoucherToEligibleUsers(DiscountCode discountCode);

    /**
     * Lấy voucher trong ví của khách hàng theo voucherId và kiểm tra điều kiện áp dụng với cartTotal.
     * Trả về AvailableVoucherDTO với cờ applicable và lý do (nếu cần).
     */
    AvailableVoucherDTO getWalletVoucherById(Customer customer, String voucherId, double cartTotal);

    /**
     * Đánh dấu voucher trong ví đã được sử dụng sau khi thanh toán thành công.
     * Gán used=true, usedDate=now, usedInOrderId=orderId.
     */
    void markWalletVoucherUsed(Customer customer, String voucherId, String orderId);

    /**
     * Lấy tất cả bản ghi ví voucher của khách hàng.
     */
    java.util.List<iuh.fit.backend.model.UserDiscountWallet> getWalletEntries(Customer customer);

    /**
     * Lấy tất cả bản ghi ví voucher theo customer_id.
     */
    java.util.List<iuh.fit.backend.model.UserDiscountWallet> getWalletEntriesByUserId(String userId);

    /**
     * Đổi voucher bằng loyalty points: tạo bản ghi vào UserDiscountWallet và trừ điểm trên Customer.
     * Trả về id của wallet entry vừa tạo.
     */
    Long exchangeVoucher(Customer customer, String voucherId, int pointsToSpend);
}
