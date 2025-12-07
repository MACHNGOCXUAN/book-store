package iuh.fit.backend.service.impl;

import java.time.LocalDate;
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
            // Mark as used
            UserDiscountWallet w = wallet.get();
            w.markAsUsed(""); // orderId sẽ được set sau khi order được tạo
            userDiscountWalletRepository.save(w);
        } else {
            // Public voucher - giảm quantity
            if (voucher.getQuantity() > 0) {
                voucher.setQuantity(voucher.getQuantity() - 1);
                discountCodeRepository.save(voucher);
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
                    CustomerTier customerTier = customer.getTier() != null ? customer.getTier() : CustomerTier.NEW_USER;
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

        wallet.markAsUsed(orderId);
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

    /**
     * Phân phối voucher đến các khách hàng đủ điều kiện và thêm vào UserDiscountWallet.
     */
    @Override
    @Transactional
    public int distributeVoucherToEligibleUsers(DiscountCode discountCode) {
        int created = 0;

        // Xác định danh sách khách hàng đủ điều kiện
        List<Customer> candidates;

        boolean isPublic = Boolean.TRUE.equals(discountCode.getIsPublic());
        LocalDate now = LocalDate.now();
        List<Customer> allCustomers = customerRepository.findAll();
        log.info("[VoucherDist] Total customers in DB: {}", allCustomers.size());

        if (discountCode.getMinTierRequired() == CustomerTier.NEW_USER) {
            // NEW_USER: trong vòng 3 tháng gần đây
            LocalDate threshold = now.minusMonths(3);
            candidates = allCustomers.stream()
                    .filter(c -> c.getRegistrationDate() != null && !c.getRegistrationDate().isBefore(threshold))
                    .collect(Collectors.toList());
            log.info("[VoucherDist] NEW_USER candidates (reg >= {}): {}", threshold, candidates.size());
        } else if (isPublic) {
            // Public: tất cả khách hàng đang hoạt động, có tier đáp ứng nếu minTierRequired khác null
            candidates = allCustomers.stream()
                    .filter(c -> {
                        if (discountCode.getMinTierRequired() == null) return true;
                        CustomerTier tier = c.getTier() != null ? c.getTier() : CustomerTier.NEW_USER;
                        return isTierSufficient(tier, discountCode.getMinTierRequired());
                    })
                    .collect(Collectors.toList());
            log.info("[VoucherDist] PUBLIC candidates (minTierRequired={}): {}", discountCode.getMinTierRequired(), candidates.size());
        } else {
            // Không public và không NEW_USER: phân phối theo minTierRequired nếu có
            candidates = allCustomers.stream()
                    .filter(c -> {
                        if (discountCode.getMinTierRequired() == null) return true;
                        CustomerTier tier = c.getTier() != null ? c.getTier() : CustomerTier.NEW_USER;
                        return isTierSufficient(tier, discountCode.getMinTierRequired());
                    })
                    .collect(Collectors.toList());
            log.info("[VoucherDist] NON-PUBLIC candidates (minTierRequired={}): {}", discountCode.getMinTierRequired(), candidates.size());
        }

        // Log chi tiết một vài ứng viên đầu tiên
        candidates.stream().limit(10).forEach(c -> {
            log.debug("[VoucherDist] Candidate userId={}, regDate={}, tier={}", c.getUserId(), c.getRegistrationDate(), c.getTier());
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
                    .used(false)
                    .build();
            userDiscountWalletRepository.save(wallet);
            created++;
        }

        log.info("[VoucherDist] Distributed voucher {} to {} eligible users (minTierRequired={}, isPublic={})",
                discountCode.getDiscountCodeId(), created, discountCode.getMinTierRequired(), isPublic);
        return created;
    }

    /* ========== Helper Methods ========== */

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
            CustomerTier customerTier = customer.getTier() != null ? customer.getTier() : CustomerTier.NEW_USER;
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
}
