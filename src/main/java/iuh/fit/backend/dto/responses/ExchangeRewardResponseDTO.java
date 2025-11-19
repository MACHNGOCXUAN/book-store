package iuh.fit.backend.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response khi user đổi điểm lấy voucher thành công
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRewardResponseDTO {
    private Long walletId; // ID của UserDiscountWallet vừa tạo
    private String voucherName;
    private String voucherId;
    private int discountPercent;
    private double minPriceToApply;
    private int pointsSpent; // điểm đã trừ
    private Integer remainingPoints; // điểm còn lại
    private String message; // "Đổi thành công! Voucher đã được thêm vào ví của bạn"
}
