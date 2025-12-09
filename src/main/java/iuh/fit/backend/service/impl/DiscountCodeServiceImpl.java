package iuh.fit.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.backend.dto.responses.AvailableVoucherDTO;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.UserDiscountWallet;
import iuh.fit.backend.model.enums.CustomerTier;
import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.repository.DiscountCodeRepository;
import iuh.fit.backend.repository.UserDiscountWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountCodeServiceImpl implements iuh.fit.backend.service.DiscountCodeService {
    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountWalletRepository userDiscountWalletRepository;
    private final CustomerRepository customerRepository;

    @Override
    public List<DiscountCode> findAll() {
        return discountCodeRepository.findAll();
    }

    @Override
    public List<DiscountCode> filterDiscountCode(String code, DiscountType type, String description) {

        boolean hasCode = (code != null && !code.isEmpty());
        boolean hasType = (type != null);
        boolean hasDescription = (description != null && !description.isEmpty());

        if (hasCode && hasType && hasDescription) {
            return discountCodeRepository.findByNameContainingAndDiscountTypeAndDescriptionContaining(code, type, description);
        } else if (hasCode && hasType) {
            return discountCodeRepository.findByNameContainingAndDiscountType(code, type);
        } else if (hasCode && hasDescription) {
            return discountCodeRepository.findByNameContainingAndDescriptionContaining(code, description);
        } else if (hasType && hasDescription) {
            return discountCodeRepository.findByDiscountTypeAndDescriptionContaining(type, description);
        } else if (hasCode) {
            return discountCodeRepository.findByNameContaining(code);
        } else if (hasType) {
            return discountCodeRepository.findByDiscountType(type);
        } else if (hasDescription) {
            return discountCodeRepository.findByDescriptionContaining(description);
        }

        return discountCodeRepository.findAll();
    }

    @Override
    public DiscountCode save(DiscountCode discountCode){
        if (discountCode.getDiscountCodeId() == null || discountCode.getDiscountCodeId().isBlank()) {
            String prefix = "DC";
            int nextNum = (int) (discountCodeRepository.count() + 1);
            discountCode.setDiscountCodeId(prefix + String.format("%03d", nextNum));
        }
        return discountCodeRepository.save(discountCode);
    }

    @Override
    public DiscountCode findById(String id){
        return discountCodeRepository.findById(id).orElse(null);
    }

    /* ========== New Methods for Loyalty+Tier System (Luồng C) ========== */

    @Override
    public List<AvailableVoucherDTO> getAvailableVouchersForCheckout(Customer customer, double cartTotal) {
        log.info("Getting available vouchers for customer: {} with cart total: {}", customer.getUserId(), cartTotal);

        List<AvailableVoucherDTO> result = new java.util.ArrayList<>();

        // 1. Lấy PUBLIC voucher
        List<DiscountCode> publicVouchers = discountCodeRepository.findByIsPublicTrue();
        log.info("Found {} public vouchers", publicVouchers.size());
        for (DiscountCode vc : publicVouchers) {
            log.debug("Checking voucher: {} - isPublic: {}, quantity: {}, startDate: {}, endDate: {}", 
                vc.getDiscountCodeId(), vc.getIsPublic(), vc.getQuantity(), vc.getStartDate(), vc.getEndDate());
            if (isVoucherValid(vc, customer, cartTotal)) {
                log.debug("Voucher {} is valid, adding to result", vc.getDiscountCodeId());
                result.add(buildAvailableVoucherDTO(vc, true, false));
            } else {
                log.debug("Voucher {} is NOT valid", vc.getDiscountCodeId());
            }
        }

        // 2. Lấy voucher từ wallet của user (voucher đã đổi)
        List<UserDiscountWallet> userWallets = userDiscountWalletRepository.findByCustomerAndUsedFalse(customer);
        log.info("Found {} vouchers in user wallet", userWallets.size());
        for (UserDiscountWallet wallet : userWallets) {
            DiscountCode vc = wallet.getDiscountCode();
            log.debug("Checking wallet voucher: {} - quantity: {}, startDate: {}, endDate: {}", 
                vc.getDiscountCodeId(), vc.getQuantity(), vc.getStartDate(), vc.getEndDate());
            if (isVoucherValid(vc, customer, cartTotal)) {
                log.debug("Wallet voucher {} is valid, adding to result", vc.getDiscountCodeId());
                result.add(buildAvailableVoucherDTO(vc, false, true));
            } else {
                log.debug("Wallet voucher {} is NOT valid", vc.getDiscountCodeId());
            }
        }

        log.info("Returning {} available vouchers", result.size());
        return result;
    }

    @Override
    @Transactional
    public double applyVoucher(Customer customer, String voucherId, double cartTotal) {
        log.info("Applying voucher: {} for customer: {} with cart total: {}", voucherId, customer.getUserId(), cartTotal);

        DiscountCode voucher = discountCodeRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        // Validate
        if (!isVoucherValid(voucher, customer, cartTotal)) {
            throw new RuntimeException("Voucher không hợp lệ hoặc không thể áp dụng");
        }

        // Check xem customer có sở hữu voucher không (nếu không public)
        if (!voucher.getIsPublic()) {
            Optional<UserDiscountWallet> wallet = userDiscountWalletRepository.findByCustomerAndDiscountCodeAndUsedFalse(customer, voucher);
            if (wallet.isEmpty()) {
                throw new RuntimeException("Bạn không sở hữu voucher này");
            }
            // Chỉ decrement remainingUses (không set used=true ở đây)
            UserDiscountWallet w = wallet.get();
            w.decrementRemainingUses();
            userDiscountWalletRepository.save(w);
            log.info("Voucher {} decremented. remainingUses now: {}", voucherId, w.getRemainingUses());
        } else {
            // Public voucher - giảm quantity
            if (voucher.getQuantity() > 0) {
                voucher.setQuantity(voucher.getQuantity() - 1);
                discountCodeRepository.save(voucher);
                log.info("Public voucher {} quantity decremented. quantity now: {}", voucherId, voucher.getQuantity());
            }
        }

        // Tính giảm giá
        double discountAmount = (cartTotal * voucher.getPercent()) / 100;
        log.info("Voucher applied successfully. Discount amount: {}", discountAmount);

        return discountAmount;
    }

        @Override
        public AvailableVoucherDTO getWalletVoucherById(Customer customer, String voucherId, double cartTotal) {
        DiscountCode voucher = discountCodeRepository.findById(voucherId)
            .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        // Chỉ kiểm tra ví cho voucher không public (cá nhân hóa)
        Optional<UserDiscountWallet> walletOpt = userDiscountWalletRepository
            .findByCustomerAndDiscountCodeAndUsedFalse(customer, voucher);

        if (walletOpt.isEmpty()) {
            // Không sở hữu hoặc đã dùng
            return AvailableVoucherDTO.builder()
                .voucherId(voucher.getDiscountCodeId())
                .voucherName(voucher.getName())
                .discountPercent(voucher.getPercent())
                .minPriceToApply(voucher.getMinPriceToApply())
                .description(voucher.getDescription())
                .isPublic(Boolean.TRUE.equals(voucher.getIsPublic()))
                .isFromWallet(false)
                .isExclusive(voucher.getMinTierRequired() != null)
                .voucherTag(buildVoucherTag(voucher, Boolean.TRUE.equals(voucher.getIsPublic()), false))
                .applicable(false)
                .reason("Không sở hữu voucher hoặc voucher đã dùng")
                .build();
        }

        boolean valid = isVoucherValid(voucher, customer, cartTotal);
        String reason = null;
        if (!valid) {
            // Tạo lý do cơ bản từ các điều kiện
            if (voucher.getQuantity() <= 0) reason = "Voucher đã hết số lượng";
            else {
                LocalDate today = LocalDate.now();
                if (voucher.getStartDate().isAfter(today) || voucher.getEndDate().isBefore(today)) {
                    reason = "Voucher không trong thời gian hiệu lực";
                } else if (cartTotal < voucher.getMinPriceToApply()) {
                    reason = "Tổng đơn chưa đạt mức tối thiểu";
                } else if (voucher.getMinTierRequired() != null) {
                    Integer pointsObj = customer.getLoyaltyPoints();
                    int loyaltyPoints;
                    if (pointsObj != null) {
                        loyaltyPoints = pointsObj;
                    } else {
                        loyaltyPoints = 0;
                    }
                    CustomerTier customerTier = calculateTierFromPoints(loyaltyPoints);
                    if (!isTierSufficient(customerTier, voucher.getMinTierRequired())) {
                        reason = "Tier khách hàng không đủ điều kiện";
                    }
                }
                if (reason == null) reason = "Voucher không hợp lệ";
            }
        }

        return AvailableVoucherDTO.builder()
            .voucherId(voucher.getDiscountCodeId())
            .voucherName(voucher.getName())
            .discountPercent(voucher.getPercent())
            .minPriceToApply(voucher.getMinPriceToApply())
            .description(voucher.getDescription())
            .isPublic(Boolean.TRUE.equals(voucher.getIsPublic()))
            .isFromWallet(true)
            .isExclusive(voucher.getMinTierRequired() != null)
            .voucherTag(buildVoucherTag(voucher, Boolean.TRUE.equals(voucher.getIsPublic()), true))
                .applicable(valid)
                .reason(reason)
            .build();
        }

        @Override
        @Transactional
        public void markWalletVoucherUsed(Customer customer, String voucherId, String orderId) {
        DiscountCode voucher = discountCodeRepository.findById(voucherId)
            .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        UserDiscountWallet wallet = userDiscountWalletRepository
            .findByCustomerAndDiscountCodeAndUsedFalse(customer, voucher)
            .orElseThrow(() -> new RuntimeException("Voucher không khả dụng hoặc đã được sử dụng"));

        // ⭐ Decrement remainingUses
        wallet.decrementRemainingUses();
        wallet.setUsedInOrderId(orderId);
        wallet.setUsedDate(LocalDateTime.now());
        
        // Set used=true nếu remainingUses = 0
        if (wallet.isExhausted()) {
            wallet.markAsUsed(orderId);
            log.info("Voucher {} marked as USED (remainingUses=0) in order {} for customer {}", 
                    voucherId, orderId, customer.getUserId());
        } else {
            log.info("Voucher {} applied in order {} for customer {}. remainingUses: {}", 
                    voucherId, orderId, customer.getUserId(), wallet.getRemainingUses());
        }
        
        userDiscountWalletRepository.save(wallet);
        }

    @Override
    public java.util.List<UserDiscountWallet> getWalletEntries(Customer customer) {
        return userDiscountWalletRepository.findByCustomer(customer);
    }

    @Override
    public java.util.List<UserDiscountWallet> getWalletEntriesByUserId(String userId) {
        return userDiscountWalletRepository.findByCustomer_UserId(userId);
    }

    @Override
    @Transactional
    public Long exchangeVoucher(Customer customer, String voucherId, int pointsToSpend) {
        DiscountCode voucher = discountCodeRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        if (!customer.hasEnoughPoints(pointsToSpend)) {
            throw new RuntimeException("Không đủ điểm loyalty để đổi voucher này");
        }

        // Prevent duplicates: if wallet already has this discount for customer
        boolean exists = userDiscountWalletRepository.existsByCustomerAndDiscountCode(customer, voucher);
        if (exists) {
            throw new RuntimeException("Bạn đã sở hữu voucher này trong ví");
        }

        // Deduct points
        boolean ok = customer.redeemLoyaltyPoints(pointsToSpend);
        if (!ok) {
            throw new RuntimeException("Không đủ điểm loyalty");
        }
        customerRepository.save(customer);

        // Create wallet entry with remainingUses = maxQuantityCanUse
        UserDiscountWallet wallet = UserDiscountWallet.builder()
                .customer(customer)
                .discountCode(voucher)
                .remainingUses(voucher.getMaxQuantityCanUse())
                .used(false)
                .build();
        UserDiscountWallet saved = userDiscountWalletRepository.save(wallet);
        log.info("Voucher {} exchanged for customer {}. remainingUses set to {}", 
                voucherId, customer.getUserId(), voucher.getMaxQuantityCanUse());
        return saved.getId();
    }

    /**
     * Phân phối voucher đến các khách hàng đủ điều kiện và thêm vào UserDiscountWallet.
     * 
     * Quy tắc phân phối:
     * - isPublic=true: phân phối cho tất cả khách hàng đủ điều kiện (minTierRequired)
     * - isPublic=false, redeemable=false: phân phối cho nhóm khách hàng cụ thể (minTierRequired)
     * - isPublic=false, redeemable=true: KHÔNG phân phối tự động, khách hàng tự trao đổi
     */
    @Override
    @Transactional
    public int distributeVoucherToEligibleUsers(DiscountCode discountCode) {
        int created = 0;

        // SKIP nếu là redeemable voucher (khách hàng tự trao đổi)
        if (Boolean.FALSE.equals(discountCode.getIsPublic()) && Boolean.TRUE.equals(discountCode.getRedeemable())) {
            log.info("[VoucherDist] SKIP distributing redeemable voucher {} - customers must exchange", 
                    discountCode.getDiscountCodeId());
            return 0;
        }

        // Xác định danh sách khách hàng đủ điều kiện
        List<Customer> candidates;

        boolean isPublic = Boolean.TRUE.equals(discountCode.getIsPublic());
        List<Customer> allCustomers = customerRepository.findAll();
        log.info("[VoucherDist] Total customers in DB: {}", allCustomers.size());

        if (discountCode.getMinTierRequired() == CustomerTier.NEW_USER) {
            // NEW_USER: tất cả khách hàng (vì NEW_USER là tier thấp nhất)
            candidates = allCustomers;
            log.info("[VoucherDist] NEW_USER candidates: {} (all customers)", candidates.size());
        } else if (isPublic) {
            // Public: chỉ khách hàng có điểm đủ cho tier yêu cầu
            candidates = allCustomers.stream()
                    .filter(c -> {
                        if (discountCode.getMinTierRequired() == null) return true;
                        int points = java.util.Optional.ofNullable(c.getLoyaltyPoints()).orElse(0);
                        CustomerTier calculatedTier = calculateTierFromPoints(points);
                        return isTierSufficient(calculatedTier, discountCode.getMinTierRequired());
                    })
                    .collect(Collectors.toList());
            log.info("[VoucherDist] PUBLIC candidates (minTierRequired={}, filtered by points): {}", 
                discountCode.getMinTierRequired(), candidates.size());
        } else {
            // Không public: phân phối dựa trên điểm loyalty của customer
            candidates = allCustomers.stream()
                    .filter(c -> {
                        if (discountCode.getMinTierRequired() == null) return true;
                        int points = java.util.Optional.ofNullable(c.getLoyaltyPoints()).orElse(0);
                        CustomerTier calculatedTier = calculateTierFromPoints(points);
                        return isTierSufficient(calculatedTier, discountCode.getMinTierRequired());
                    })
                    .collect(Collectors.toList());
            log.info("[VoucherDist] NON-PUBLIC candidates (minTierRequired={}, filtered by points): {}", 
                discountCode.getMinTierRequired(), candidates.size());
        }

        // Log chi tiết một vài ứng viên đầu tiên
        candidates.stream().limit(10).forEach(c -> {
            int points = java.util.Optional.ofNullable(c.getLoyaltyPoints()).orElse(0);
            CustomerTier tier = calculateTierFromPoints(points);
            log.debug("[VoucherDist] Candidate userId={}, loyaltyPoints={}, calculatedTier={}", 
                c.getUserId(), points, tier);
        });

        // Tạo wallet entries, tránh trùng
        for (Customer customer : candidates) {
            boolean exists = userDiscountWalletRepository.existsByCustomerAndDiscountCode(customer, discountCode);
            if (exists) {
                log.debug("[VoucherDist] Skip existing wallet for userId={} and discountCodeId={}",
                        customer.getUserId(), discountCode.getDiscountCodeId());
                continue;
            }

            UserDiscountWallet wallet = UserDiscountWallet.builder()
                    .customer(customer)
                    .discountCode(discountCode)
                    .remainingUses(discountCode.getMaxQuantityCanUse())
                    .used(false)
                    .build();
            userDiscountWalletRepository.save(wallet);
            created++;
        }

        log.info("[VoucherDist] Distributed voucher {} to {} eligible users (minTierRequired={}, isPublic={}, redeemable={})",
                discountCode.getDiscountCodeId(), created, discountCode.getMinTierRequired(), isPublic, 
                discountCode.getRedeemable());
        return created;
    }

    /* ========== Helper Methods ========== */

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

    private boolean isVoucherValid(DiscountCode voucher, Customer customer, double cartTotal) {
        // Check 1: Quantity > 0
        if (voucher.getQuantity() <= 0) {
            log.debug("Voucher {} failed: quantity <= 0 ({})", voucher.getDiscountCodeId(), voucher.getQuantity());
            return false;
        }

        // Check 2: Ngày hợp lệ
        LocalDate today = LocalDate.now();
        if (voucher.getStartDate().isAfter(today) || voucher.getEndDate().isBefore(today)) {
            log.debug("Voucher {} failed: date invalid. today={}, startDate={}, endDate={}", 
                voucher.getDiscountCodeId(), today, voucher.getStartDate(), voucher.getEndDate());
            return false;
        }

        // Check 3: Min price to apply
        if (cartTotal < voucher.getMinPriceToApply()) {
            log.debug("Voucher {} failed: cartTotal ({}) < minPriceToApply ({})", 
                voucher.getDiscountCodeId(), cartTotal, voucher.getMinPriceToApply());
            return false;
        }

        // Check 4: Tier requirement
        if (voucher.getMinTierRequired() != null) {
            int loyaltyPoints;
            Integer pointsObj = customer.getLoyaltyPoints();
            if (pointsObj != null) {
                loyaltyPoints = pointsObj;
            } else {
                loyaltyPoints = 0;
            }
            CustomerTier customerTier = calculateTierFromPoints(loyaltyPoints);
            if (!isTierSufficient(customerTier, voucher.getMinTierRequired())) {
                log.debug("Voucher {} failed: tier insufficient. customerTier={}, minTierRequired={}", 
                    voucher.getDiscountCodeId(), customerTier, voucher.getMinTierRequired());
                return false;
            }
        }

        log.debug("Voucher {} is valid", voucher.getDiscountCodeId());
        return true;
    }

    private AvailableVoucherDTO buildAvailableVoucherDTO(DiscountCode voucher, boolean isPublic, boolean isFromWallet) {
        return AvailableVoucherDTO.builder()
                .voucherId(voucher.getDiscountCodeId())
                .voucherName(voucher.getName())
                .discountPercent(voucher.getPercent())
                .minPriceToApply(voucher.getMinPriceToApply())
                .description(voucher.getDescription())
                .isPublic(isPublic)
                .isFromWallet(isFromWallet)
                .isExclusive(voucher.getMinTierRequired() != null)
                .voucherTag(buildVoucherTag(voucher, isPublic, isFromWallet))
                .applicable(true)
                .build();
    }

    private String buildVoucherTag(DiscountCode voucher, boolean isPublic, boolean isFromWallet) {
        if (isFromWallet) {
            return "⭐ Mã của bạn";
        }
        if (voucher.getMinTierRequired() == CustomerTier.DIAMOND) {
            return "💎 Diamond";
        }
        if (voucher.getMinTierRequired() == CustomerTier.VIP) {
            return "🎁 VIP";
        }
        return Boolean.TRUE.equals(isPublic) ? "🎉 Công khai" : "🎟️ Cá nhân";
    }

    private boolean isTierSufficient(CustomerTier current, CustomerTier required) {
        return current.ordinal() >= required.ordinal();
    }

    /**
     * Phân phối thêm voucher cho các khách hàng mới phù hợp sau khi update DiscountCode.
     * Tương tự distributeVoucherToEligibleUsers() nhưng chỉ tạo cho khách mới phù hợp.
     */
    @Override
    @Transactional
    public int distributeVoucherToNewEligibleUsers(DiscountCode discountCode) {
        int created = 0;

        // SKIP nếu là redeemable voucher (khách hàng tự trao đổi)
        if (Boolean.FALSE.equals(discountCode.getIsPublic()) && Boolean.TRUE.equals(discountCode.getRedeemable())) {
            log.info("[VoucherDistUpdate] SKIP distributing redeemable voucher {} - customers must exchange", 
                    discountCode.getDiscountCodeId());
            return 0;
        }

        // Xác định danh sách khách hàng đủ điều kiện
        List<Customer> candidates;

        boolean isPublic = Boolean.TRUE.equals(discountCode.getIsPublic());
        List<Customer> allCustomers = customerRepository.findAll();
        log.info("[VoucherDistUpdate] Total customers in DB: {}", allCustomers.size());

        if (discountCode.getMinTierRequired() == CustomerTier.NEW_USER) {
            candidates = allCustomers;
            log.info("[VoucherDistUpdate] NEW_USER candidates: {} (all customers)", candidates.size());
        } else if (isPublic) {
            candidates = allCustomers.stream()
                    .filter(c -> {
                        if (discountCode.getMinTierRequired() == null) return true;
                        int points = java.util.Optional.ofNullable(c.getLoyaltyPoints()).orElse(0);
                        CustomerTier calculatedTier = calculateTierFromPoints(points);
                        return isTierSufficient(calculatedTier, discountCode.getMinTierRequired());
                    })
                    .collect(Collectors.toList());
            log.info("[VoucherDistUpdate] PUBLIC candidates (minTierRequired={}, filtered by points): {}", 
                discountCode.getMinTierRequired(), candidates.size());
        } else {
            candidates = allCustomers.stream()
                    .filter(c -> {
                        if (discountCode.getMinTierRequired() == null) return true;
                        int points = java.util.Optional.ofNullable(c.getLoyaltyPoints()).orElse(0);
                        CustomerTier calculatedTier = calculateTierFromPoints(points);
                        return isTierSufficient(calculatedTier, discountCode.getMinTierRequired());
                    })
                    .collect(Collectors.toList());
            log.info("[VoucherDistUpdate] NON-PUBLIC candidates (minTierRequired={}, filtered by points): {}", 
                discountCode.getMinTierRequired(), candidates.size());
        }

        // Tạo wallet entries chỉ cho những khách hàng CHƯA sở hữu voucher này
        for (Customer customer : candidates) {
            boolean exists = userDiscountWalletRepository.existsByCustomerAndDiscountCode(customer, discountCode);
            if (exists) {
                log.debug("[VoucherDistUpdate] Skip existing wallet for userId={} and discountCodeId={}",
                        customer.getUserId(), discountCode.getDiscountCodeId());
                continue;
            }

            UserDiscountWallet wallet = UserDiscountWallet.builder()
                    .customer(customer)
                    .discountCode(discountCode)
                    .remainingUses(discountCode.getMaxQuantityCanUse())
                    .used(false)
                    .build();
            userDiscountWalletRepository.save(wallet);
            created++;
        }

        log.info("[VoucherDistUpdate] Distributed voucher {} to {} NEW eligible users (minTierRequired={}, isPublic={}, redeemable={})",
                discountCode.getDiscountCodeId(), created, discountCode.getMinTierRequired(), isPublic, 
                discountCode.getRedeemable());
        return created;
    }
}
