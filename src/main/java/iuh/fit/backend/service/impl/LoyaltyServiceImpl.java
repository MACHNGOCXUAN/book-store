package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.enums.CustomerTier;
import iuh.fit.backend.dto.responses.LoyaltyInfoDTO;
import iuh.fit.backend.dto.responses.TierUpgradeNotificationDTO;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class LoyaltyServiceImpl implements LoyaltyService {

    private final CustomerRepository customerRepository;

    private static final int LOYALTY_POINTS_DIVISOR = 10000; // 1 point = 10,000 VND

    @Override
    public TierUpgradeNotificationDTO addLoyaltyPointsFromOrder(Customer customer, double totalAmount) {
        log.info("Adding loyalty points for customer: {} with amount: {}", customer.getUserId(), totalAmount);

        // Tính điểm thưởng: floor(totalAmount / 10,000)
        int earnPoints = (int) Math.floor(totalAmount / LOYALTY_POINTS_DIVISOR);
        log.debug("Earned points: {}", earnPoints);

        // Lưu tier cũ
        CustomerTier oldTier = customer.getTier();

        // Cộng điểm - method này cũng tự update tier
        boolean tierChanged = customer.addLoyaltyPoints(earnPoints);

        // Lưu lại customer
        customerRepository.save(customer);

        // Nếu tier thay đổi, tạo notification
        if (tierChanged) {
            CustomerTier newTier = customer.getTier();
            log.info("Customer {} upgraded from {} to {}", customer.getUserId(), oldTier, newTier);

            return TierUpgradeNotificationDTO.builder()
                    .customerId(customer.getUserId())
                    .customerName(customer.getFullName())
                    .totalPoints(customer.getLoyaltyPoints())
                    .oldTier(oldTier)
                    .newTier(newTier)
                    .message(String.format("Chúc mừng! Bạn đã nâng lên tier %s", getTierDisplayName(newTier)))
                    .benefit(getTierBenefit(newTier))
                    .build();
        }

        return null;
    }

    @Override
    public boolean redeemPointsForVoucher(Customer customer, int points) {
        log.info("Redeeming {} points for customer: {}", points, customer.getUserId());

        if (!customer.hasEnoughPoints(points)) {
            log.warn("Customer {} does not have enough points. Required: {}, Available: {}",
                    customer.getUserId(), points, customer.getLoyaltyPoints());
            return false;
        }

        customer.redeemLoyaltyPoints(points);
        customerRepository.save(customer);
        log.info("Successfully redeemed {} points. Remaining: {}", points, customer.getLoyaltyPoints());
        return true;
    }

    @Override
    public LoyaltyInfoDTO getLoyaltyInfo(Customer customer) {
        int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
        CustomerTier currentTier = customer.getTier() != null ? customer.getTier() : CustomerTier.NEW_USER;
        int pointsToNext = LoyaltyInfoDTO.calculatePointsToNextTier(currentPoints, currentTier);

        return LoyaltyInfoDTO.builder()
                .currentPoints(currentPoints)
                .currentTier(currentTier)
                .pointsToNextTier(pointsToNext)
                .tierName(getTierDisplayName(currentTier))
                .tierDescription(getTierDescription(currentTier))
                .build();
    }

    @Override
    public boolean hasEnoughPoints(Customer customer, int requiredPoints) {
        return customer.hasEnoughPoints(requiredPoints);
    }

    /* ========== Helper Methods ========== */

    private String getTierDisplayName(CustomerTier tier) {
        return switch (tier) {
            case NEW_USER -> "Người dùng mới";
            case REGULAR -> "Thành viên thường";
            case VIP -> "Thành viên VIP";
            case DIAMOND -> "Thành viên Diamond";
        };
    }

    private String getTierBenefit(CustomerTier tier) {
        return switch (tier) {
            case NEW_USER -> "Bắt đầu tích điểm ngay";
            case REGULAR -> "Unlock voucher cho thành viên thường (≥100 điểm)";
            case VIP -> "Unlock voucher VIP exclusive (≥500 điểm)";
            case DIAMOND -> "Unlock voucher Diamond VIP (≥2000 điểm) + Lợi ích tối cao";
        };
    }

    private String getTierDescription(CustomerTier tier) {
        return switch (tier) {
            case NEW_USER -> "Bạn là thành viên mới. Tiếp tục mua sắm để nâng tier";
            case REGULAR -> "Bạn đã là thành viên thường. Mua thêm 400 điểm để lên VIP";
            case VIP -> "Bạn là thành viên VIP. Mua thêm 1500 điểm để lên Diamond";
            case DIAMOND -> "Bạn là thành viên Diamond - tier cao nhất!";
        };
    }
}
