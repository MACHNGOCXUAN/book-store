package iuh.fit.backend.model.enums;

/**
 * Tiered membership system for loyalty program
 * Points progression: NEW_USER → REGULAR → VIP → DIAMOND
 */
public enum CustomerTier {
    NEW_USER(0),
    REGULAR(100),
    VIP(500),
    DIAMOND(2000);

    private final int minPoints;

    CustomerTier(int minPoints) {
        this.minPoints = minPoints;
    }

    public int getMinPoints() {
        return minPoints;
    }

    /**
     * Determine tier based on loyalty points
     * @param points customer's total loyalty points
     * @return appropriate tier
     */
    public static CustomerTier getTierByPoints(int points) {
        if (points >= DIAMOND.minPoints) return DIAMOND;
        if (points >= VIP.minPoints) return VIP;
        if (points >= REGULAR.minPoints) return REGULAR;
        return NEW_USER;
    }
}
