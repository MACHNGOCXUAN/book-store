package iuh.fit.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.backend.dto.requests.ExchangeRewardRequestDTO;
import iuh.fit.backend.dto.responses.ExchangeRewardResponseDTO;
import iuh.fit.backend.dto.responses.ExchangeableVoucherDTO;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.UserDiscountWallet;
import iuh.fit.backend.model.enums.CustomerTier;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.repository.DiscountCodeRepository;
import iuh.fit.backend.repository.UserDiscountWalletRepository;
import iuh.fit.backend.service.RewardExchangeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class RewardExchangeServiceImpl implements RewardExchangeService {

    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountWalletRepository userDiscountWalletRepository;
    private final CustomerRepository customerRepository;

    /**
     * Tính tier của customer dựa trên loyalty points
     * Tier thresholds: NEW_USER(0), REGULAR(100), VIP(500), DIAMOND(2000)
     */
    private CustomerTier calculateTierFromPoints(int loyaltyPoints) {
        if (loyaltyPoints >= 2000) return CustomerTier.DIAMOND;
        if (loyaltyPoints >= 500) return CustomerTier.VIP;
        if (loyaltyPoints >= 100) return CustomerTier.REGULAR;
        return CustomerTier.NEW_USER;
    }

    @Override
    public List<ExchangeableVoucherDTO> getExchangeableVouchers(Customer customer) {
        log.info("Getting exchangeable vouchers for customer: {}", customer.getUserId());

        // Lấy tất cả voucher có redeemable=true
        List<DiscountCode> redeemableVouchers = discountCodeRepository.findByRedeemableTrue();

        int currentPoints = java.util.Optional.ofNullable(customer.getLoyaltyPoints()).orElse(0);
        CustomerTier currentTier = calculateTierFromPoints(currentPoints);

        return redeemableVouchers.stream()
                .map(voucher -> buildExchangeableVoucherDTO(voucher, currentPoints, currentTier))
                .collect(Collectors.toList());
    }

    @Override
    public ExchangeRewardResponseDTO exchangeReward(Customer customer, ExchangeRewardRequestDTO request) {
        log.info("Exchanging reward for customer: {} with voucher: {}", customer.getUserId(), request.getVoucherId());

        // Lấy voucher từ DB
        DiscountCode voucher = discountCodeRepository.findById(request.getVoucherId())
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại: " + request.getVoucherId()));

        // Validate điều kiện
        validateExchange(customer, voucher);

        // Trừ loyaltyPoints từ customer
        if (!customer.redeemLoyaltyPoints(voucher.getRedeemCost())) {
            throw new RuntimeException("Không đủ điểm để đổi voucher này");
        }

        // Tạo UserDiscountWallet
        UserDiscountWallet wallet = UserDiscountWallet.builder()
                .customer(customer)
                .discountCode(voucher)
                .used(false)
                .acquiredDate(LocalDateTime.now())
                .build();

        userDiscountWalletRepository.save(wallet);

        // Giảm quantity của voucher (nếu có limit)
        if (voucher.getQuantity() > 0) {
            voucher.setQuantity(voucher.getQuantity() - 1);
            discountCodeRepository.save(voucher);
        }

        // Lưu customer với points đã trừ
        customerRepository.save(customer);

        log.info("Successfully exchanged voucher. Wallet ID: {}, Remaining points: {}",
                wallet.getId(), customer.getLoyaltyPoints());

        return ExchangeRewardResponseDTO.builder()
                .walletId(wallet.getId())
                .voucherId(voucher.getDiscountCodeId())
                .voucherName(voucher.getName())
                .discountPercent(voucher.getPercent())
                .minPriceToApply(voucher.getMinPriceToApply())
                .pointsSpent(voucher.getRedeemCost())
                .remainingPoints(customer.getLoyaltyPoints())
                .message("🎉 Đổi thành công! Voucher đã được thêm vào ví của bạn")
                .build();
    }

    @Override
    public void validateExchange(Customer customer, DiscountCode discountCode) {
        log.debug("Validating exchange for customer: {} and voucher: {}", customer.getUserId(), discountCode.getDiscountCodeId());

        // Check 1: Voucher có redeemable không
        if (!discountCode.getRedeemable()) {
            throw new RuntimeException("Voucher này không thể đổi bằng điểm");
        }

        // Check 2: Voucher còn lượng không
        if (discountCode.getQuantity() <= 0) {
            throw new RuntimeException("Voucher này đã hết. Vui lòng chọn voucher khác");
        }

        // Check 3: User có đủ điểm không
        Integer loyaltyPointsObj = customer.getLoyaltyPoints();
        int currentPoints = loyaltyPointsObj != null ? loyaltyPointsObj : 0;
        if (currentPoints < discountCode.getRedeemCost()) {
            int pointsNeeded = discountCode.getRedeemCost() - currentPoints;
            throw new RuntimeException("🔒 Cần thêm " + pointsNeeded + " điểm để đổi voucher này");
        }

        // Check 4: User có tier đủ không (dựa trên điểm, không dùng backend tier)
        if (discountCode.getMinTierRequired() != null) {
            CustomerTier calculatedTier = calculateTierFromPoints(currentPoints);
            if (!isTierSufficient(calculatedTier, discountCode.getMinTierRequired())) {
                throw new RuntimeException("🔒 Chỉ dành cho " + getTierDisplayName(discountCode.getMinTierRequired()) + " trở lên");
            }
        }

        // Check 5: Voucher còn effective không
        LocalDate today = LocalDate.now();
        if (discountCode.getStartDate().isAfter(today) || discountCode.getEndDate().isBefore(today)) {
            throw new RuntimeException("Mã giảm giá này đã hết hạn");
        }

        log.debug("Validation passed");
    }

    /* ========== Helper Methods ========== */

    private ExchangeableVoucherDTO buildExchangeableVoucherDTO(DiscountCode voucher, int currentPoints, CustomerTier currentTier) {
        boolean isExchangeable = canExchange(voucher, currentPoints, currentTier);
        String lockReason = null;
        int remainingPoints = 0;

        if (!isExchangeable) {
            if (currentPoints < voucher.getRedeemCost()) {
                remainingPoints = voucher.getRedeemCost() - currentPoints;
                lockReason = "🔒 Cần thêm " + remainingPoints + " điểm để đổi";
            } else if (voucher.getMinTierRequired() != null && !isTierSufficient(currentTier, voucher.getMinTierRequired())) {
                lockReason = "🔒 Chỉ dành cho " + getTierDisplayName(voucher.getMinTierRequired()) + " trở lên";
            }
        }

        return ExchangeableVoucherDTO.builder()
                .voucherId(voucher.getDiscountCodeId())
                .voucherName(voucher.getName())
                .description(voucher.getDescription())
                .discountPercent(voucher.getPercent())
                .minPriceToApply(voucher.getMinPriceToApply())
                .redeemCost(voucher.getRedeemCost())
                .minTierRequired(voucher.getMinTierRequired() != null ? voucher.getMinTierRequired().toString() : null)
                .isExchangeable(isExchangeable)
                .lockReason(lockReason)
                .remainingPoints(remainingPoints)
                .build();
    }

    private boolean canExchange(DiscountCode voucher, int currentPoints, CustomerTier currentTier) {
        // Check điểm
        if (currentPoints < voucher.getRedeemCost()) {
            return false;
        }

        // Check quantity
        if (voucher.getQuantity() <= 0) {
            return false;
        }

        // Check tier
        if (voucher.getMinTierRequired() != null) {
            if (!isTierSufficient(currentTier, voucher.getMinTierRequired())) {
                return false;
            }
        }

        // Check ngày tháng năm
        LocalDate today = LocalDate.now();
        if (voucher.getStartDate().isAfter(today) || voucher.getEndDate().isBefore(today)) {
            return false;
        }

        return true;
    }

    private boolean isTierSufficient(CustomerTier current, CustomerTier required) {
        return current.ordinal() >= required.ordinal();
    }

    private String getTierDisplayName(CustomerTier tier) {
        return switch (tier) {
            case NEW_USER -> "Người dùng mới";
            case REGULAR -> "Thành viên thường";
            case VIP -> "Thành viên VIP";
            case DIAMOND -> "Thành viên Diamond";
        };
    }
}
