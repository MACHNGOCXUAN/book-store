package iuh.fit.backend.dto.responses;

import iuh.fit.backend.model.enums.CustomerTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response cho Loyalty Info của customer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyInfoDTO {
    private Integer currentPoints;
    private CustomerTier currentTier;
    private Integer pointsToNextTier;
    private String tierName;
    private String tierDescription;

    /**
     * Tiện hàng: tính điểm còn cần để lên tier tiếp theo
     */
    public static Integer calculatePointsToNextTier(Integer currentPoints, CustomerTier currentTier) {
        if (currentTier == CustomerTier.DIAMOND) {
            return 0; // Tier cao nhất
        }
        
        int nextTierMinPoints = 0;
        switch (currentTier) {
            case NEW_USER -> nextTierMinPoints = CustomerTier.REGULAR.getMinPoints();
            case REGULAR -> nextTierMinPoints = CustomerTier.VIP.getMinPoints();
            case VIP -> nextTierMinPoints = CustomerTier.DIAMOND.getMinPoints();
        }
        
        return Math.max(0, nextTierMinPoints - (currentPoints != null ? currentPoints : 0));
    }
}
