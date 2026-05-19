package iuh.fit.backend.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response cho danh sách voucher có thể đổi bằng điểm
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeableVoucherDTO {
    private String voucherId;
    private String voucherName;
    private String description;
    private int discountPercent;
    private double minPriceToApply;
    private int redeemCost; // số điểm cần để đổi
    private String minTierRequired; // null hoặc "VIP", "DIAMOND"
    private Boolean isExchangeable; // true = user đủ điều kiện đổi
    private String lockReason; // "Cần thêm 220 điểm" hoặc "Chỉ dành cho VIP trở lên"
    private Integer remainingPoints; // điểm còn cần để đủ điều kiện
}
