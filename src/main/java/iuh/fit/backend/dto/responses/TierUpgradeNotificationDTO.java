package iuh.fit.backend.dto.responses;

import iuh.fit.backend.model.enums.CustomerTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response khi customer tăng tier sau khi mua hàng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierUpgradeNotificationDTO {
    private String customerId;
    private String customerName;
    private int totalPoints;
    private CustomerTier oldTier;
    private CustomerTier newTier;
    private String message; // "Chúc mừng! Bạn đã nâng lên tier VIP"
    private String benefit; // "Unlock voucher VIP exclusive"
}
