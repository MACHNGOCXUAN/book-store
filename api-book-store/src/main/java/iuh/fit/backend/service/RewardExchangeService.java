package iuh.fit.backend.service;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.dto.requests.ExchangeRewardRequestDTO;
import iuh.fit.backend.dto.responses.ExchangeableVoucherDTO;
import iuh.fit.backend.dto.responses.ExchangeRewardResponseDTO;

import java.util.List;

/**
 * Luồng B - Đổi Loyalty Points lấy Mã Giảm Giá (Reward Exchange)
 * Quản lý việc user đổi điểm lấy voucher riêng tư
 */
public interface RewardExchangeService {

    /**
     * Lấy danh sách voucher có thể đổi + check điều kiện
     * @param customer khách hàng
     * @return danh sách ExchangeableVoucherDTO
     */
    List<ExchangeableVoucherDTO> getExchangeableVouchers(Customer customer);

    /**
     * Đổi loyaltyPoints lấy voucher
     * - Validate: có đủ điểm không, voucher còn lại không, tier đủ không
     * - Trừ points, tạo UserDiscountWallet, giảm quantity voucher
     * @param customer khách hàng
     * @param request ExchangeRewardRequestDTO
     * @return ExchangeRewardResponseDTO
     * @throws RuntimeException nếu không thỏa điều kiện
     */
    ExchangeRewardResponseDTO exchangeReward(Customer customer, ExchangeRewardRequestDTO request);

    /**
     * Validate nếu user có thể đổi voucher nào đó
     * @param customer khách hàng
     * @param discountCode voucher muốn đổi
     * @throws RuntimeException nếu không thỏa điều kiện
     */
    void validateExchange(Customer customer, DiscountCode discountCode);
}
