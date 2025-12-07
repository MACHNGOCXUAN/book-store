package iuh.fit.backend.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response cho danh sách voucher available khi checkout
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableVoucherDTO {
    private String voucherId;
    private String voucherName;
    private int discountPercent;
    private double minPriceToApply;
    private String description;
    
    // Các field để UI hiển thị loại voucher
    private Boolean isPublic; // public voucher?
    private Boolean isFromWallet; // voucher của user (từ đổi điểm hoặc cá nhân)?
    private Boolean isExclusive; // exclusive cho tier nào
    private String voucherTag; // "Public", "⭐ Mã của bạn", "🎁 VIP", "💎 Diamond"
    
    private Boolean applicable; // có thể apply được không
    private String reason; // lý do không áp dụng (nếu applicable=false)
}
