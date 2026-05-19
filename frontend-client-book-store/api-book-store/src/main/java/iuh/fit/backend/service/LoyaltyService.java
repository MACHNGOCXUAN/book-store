package iuh.fit.backend.service;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.dto.responses.LoyaltyInfoDTO;
import iuh.fit.backend.dto.responses.TierUpgradeNotificationDTO;

/**
 * Luồng A - Tích điểm Loyalty
 * Quản lý tích điểm khi khách hàng mua hàng
 */
public interface LoyaltyService {

    /**
     * Cộng điểm khi order thanh toán thành công
     * Công thức: earnPoints = floor(totalAmount / 10,000)
     * @param customer khách hàng
     * @param totalAmount tổng tiền đơn hàng
     * @return TierUpgradeNotificationDTO nếu tăng tier, null nếu không tăng
     */
    TierUpgradeNotificationDTO addLoyaltyPointsFromOrder(Customer customer, double totalAmount);

    /**
     * Trừ điểm khi đổi voucher
     * @param customer khách hàng
     * @param points điểm cần trừ
     * @return true nếu đủ điểm, false nếu không
     */
    boolean redeemPointsForVoucher(Customer customer, int points);

    /**
     * Lấy thông tin loyalty hiện tại của khách hàng
     * @param customer khách hàng
     * @return LoyaltyInfoDTO
     */
    LoyaltyInfoDTO getLoyaltyInfo(Customer customer);

    /**
     * Check nếu khách hàng đủ điểm
     * @param customer khách hàng
     * @param requiredPoints điểm cần
     * @return true/false
     */
    boolean hasEnoughPoints(Customer customer, int requiredPoints);
}
