package iuh.fit.backend.controller;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.fit.backend.dto.responses.AvailableVoucherDTO;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.UserDiscountWallet;
import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.repository.DiscountCodeRepository;
import iuh.fit.backend.service.DiscountCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Discount", description = "API quản lý mã giảm giá")
public class DiscountCodeController {
    private final DiscountCodeService discountCodeService;
    private final CustomerRepository customerRepository;
    private final DiscountCodeRepository discountCodeRepository;

    @GetMapping
    public ResponseEntity<?> filterDiscountCodes(
            @RequestParam(name = "discountCode", required = false) String discountCode,
            @RequestParam(name = "type", required = false) DiscountType type,
            @RequestParam(name = "description", required = false) String description,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "10") int size) {
        
        List<DiscountCode> discounts = discountCodeService.filterDiscountCode(discountCode, type, description);
        
        // Wrap response với Map để serialization đúng
        Map<String, Object> response = new HashMap<>();
        response.put("data", discounts);
        
        Map<String, Integer> paging = new HashMap<>();
        paging.put("curPage", page + 1);
        paging.put("limitPage", size);
        paging.put("totalRows", discounts.size());
        paging.put("totalPage", (int) Math.ceil((double) discounts.size() / size));
        response.put("paging", paging);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Đổi voucher bằng loyalty points: thêm vào ví và trừ điểm
     */
    @PostMapping("/exchange")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Đổi voucher bằng điểm loyalty")
    public ResponseEntity<?> exchangeVoucher(
            @RequestBody Map<String, Object> payload,
            Authentication auth) {
        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        String voucherId = String.valueOf(payload.get("voucherId"));
        int pointsToSpend = Integer.parseInt(String.valueOf(payload.getOrDefault("pointsToSpend", 0)));

        try {
            Long walletId = discountCodeService.exchangeVoucher(customer, voucherId, pointsToSpend);
            return ResponseEntity.ok(Map.of(
                    "walletVoucherId", String.valueOf(walletId),
                    "voucherId", voucherId,
                    "remainingPoints", customer.getLoyaltyPoints(),
                    "message", "✓ Đổi voucher thành công"
            ));
        } catch (RuntimeException e) {
            log.error("Exchange voucher failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<DiscountCode> createDiscount(@RequestBody DiscountCode discountCode) {
        DiscountCode savedDiscount = discountCodeService.save(discountCode);

        // Auto-distribute voucher to eligible users based on discount settings
        try {
            discountCodeService.distributeVoucherToEligibleUsers(savedDiscount);
        } catch (Exception ex) {
            log.error("Distribute voucher failed for discount {}: {}", savedDiscount.getDiscountCodeId(), ex.getMessage());
        }
        return ResponseEntity.created(URI.create("/api/discounts" + savedDiscount.getDiscountCodeId()))
                .body(savedDiscount);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountCode> getDiscountById(@PathVariable String id) {
        DiscountCode discount = discountCodeService.findById(id);
        if (discount != null) {
            return ResponseEntity.ok(discount);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountCode> updateDiscount(@PathVariable String id, @RequestBody DiscountCode discountCode) {
        if (discountCodeService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        discountCode.setDiscountCodeId(id);
        DiscountCode updatedDiscount = discountCodeService.save(discountCode);
        
        // Phân phối thêm voucher cho khách hàng mới phù hợp sau khi update
        try {
            int newDistributed = discountCodeService.distributeVoucherToNewEligibleUsers(updatedDiscount);
            log.info("Distributed updated voucher {} to {} new eligible users", id, newDistributed);
        } catch (Exception ex) {
            log.error("Distribute updated voucher failed for discount {}: {}", id, ex.getMessage());
        }
        
        return ResponseEntity.ok(updatedDiscount);
    }

    /* ========== Luồng C - Available Vouchers for Checkout ========== */

    /**
     * Lấy danh sách voucher có thể áp dụng
     * Được gọi từ CART/CHECKOUT page
     */
    @GetMapping("/available")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy danh sách voucher có thể áp dụng cho giỏ hàng")
    public ResponseEntity<List<AvailableVoucherDTO>> getAvailableVouchers(
            @RequestParam double cartTotal,
            Authentication auth) {
        log.info("Getting available vouchers for user: {} with cart total: {}", auth.getName(), cartTotal);

        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<AvailableVoucherDTO> vouchers = discountCodeService.getAvailableVouchersForCheckout(customer, cartTotal);
        return ResponseEntity.ok(vouchers);
    }

    /**
     * Áp dụng voucher và tính giảm giá
     * Được gọi từ CHECKOUT page trước khi confirm order
     */
    @PostMapping("/apply")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Áp dụng voucher vào đơn hàng")
    public ResponseEntity<?> applyVoucher(
            @RequestParam String voucherId,
            @RequestParam double cartTotal,
            Authentication auth) {
        log.info("Applying voucher: {} for user: {} with cart total: {}", voucherId, auth.getName(), cartTotal);

        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        try {
            double discountAmount = discountCodeService.applyVoucher(customer, voucherId, cartTotal);
            final double discount = discountAmount;
            return ResponseEntity.ok(new Object() {
                public String voucherId_ret = voucherId;
                public double discountAmount = discount;
                public double finalTotal = cartTotal - discount;
                public String message = "✓ Áp dụng mã giảm giá thành công";
            });
        } catch (RuntimeException e) {
            log.error("Apply voucher failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new Object() {
                public String error = e.getMessage();
            });
        }
    }

    /* ========== Wallet Voucher APIs for Client Payment Flow ========== */

    /**
     * Danh sách voucher trong ví của khách hàng hiện tại
     * Bao gồm: PUBLIC vouchers + Wallet entries (vouchers đã đổi/nhận)
     */
    @GetMapping("/wallet")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy tất cả voucher trong ví của khách hàng (public + wallet)")
    public ResponseEntity<List<Object>> getWalletVouchers(Authentication auth) {
        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        System.out.println("🔐 Getting wallet for customer userId: " + auth.getName());

        // 1. Lấy PUBLIC vouchers không hết hạn, chưa sử dụng
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        
        // Lấy public vouchers
        List<DiscountCode> publicVouchers = discountCodeRepository.findByIsPublicTrue();
        java.time.LocalDate today = java.time.LocalDate.now();
        for (DiscountCode dc : publicVouchers) {
            if (dc.getQuantity() > 0 && !dc.getStartDate().isAfter(today) && !dc.getEndDate().isBefore(today)) {
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("walletVoucherId", dc.getDiscountCodeId() + "_public");
                m.put("discountCodeId", dc.getDiscountCodeId());
                m.put("name", dc.getName());
                m.put("percent", dc.getPercent());
                m.put("minPriceToApply", dc.getMinPriceToApply());
                m.put("description", dc.getDescription());
                m.put("endDate", dc.getEndDate());
                m.put("used", false);
                m.put("remainingUses", dc.getQuantity());
                m.put("source", "PUBLIC");
                result.add(m);
            }
        }
        
        // 2. Lấy wallet entries (vouchers đã đổi)
        List<iuh.fit.backend.model.UserDiscountWallet> wallets = discountCodeService.getWalletEntries(customer);
        System.out.println("📦 Wallet entries for userId " + auth.getName() + ": " + wallets.size());
        for (UserDiscountWallet w : wallets) {
            System.out.println("  - Wallet ID: " + w.getId() + ", UserId: " + w.getCustomer().getUserId() + ", Used: " + w.getUsed());
            DiscountCode dc = w.getDiscountCode();
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("walletVoucherId", String.valueOf(w.getId()));
            m.put("discountCodeId", dc.getDiscountCodeId());
            m.put("name", dc.getName());
            m.put("percent", dc.getPercent());
            m.put("minPriceToApply", dc.getMinPriceToApply());
            m.put("description", dc.getDescription());
            m.put("endDate", dc.getEndDate());
            m.put("used", Boolean.TRUE.equals(w.getUsed()));
            m.put("remainingUses", w.getRemainingUses() != null ? w.getRemainingUses() : 1);
            m.put("source", "EXCLUSIVE");
            result.add(m);
        }

        return ResponseEntity.ok((List) result);
    }

    /**
     * Danh sách ví theo customer_id (dùng cho admin/staff)
     */
    @GetMapping("/wallet/by-customer/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary = "Lấy tất cả voucher trong ví theo userId")
    public ResponseEntity<List<Object>> getWalletVouchersByCustomerId(@PathVariable String userId) {
        List<iuh.fit.backend.model.UserDiscountWallet> wallets = discountCodeService.getWalletEntriesByUserId(userId);

        List<java.util.Map<String, Object>> result = wallets.stream().map(w -> {
            DiscountCode dc = w.getDiscountCode();
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("walletVoucherId", String.valueOf(w.getId()));
            m.put("discountCodeId", dc.getDiscountCodeId());
            m.put("name", dc.getName());
            m.put("percent", dc.getPercent());
            m.put("minPriceToApply", dc.getMinPriceToApply());
            m.put("description", dc.getDescription());
            m.put("endDate", dc.getEndDate());
            m.put("used", Boolean.TRUE.equals(w.getUsed()));
            m.put("remainingUses", w.getRemainingUses() != null ? w.getRemainingUses() : 1);
            m.put("source", Boolean.TRUE.equals(dc.getIsPublic()) ? "PUBLIC" : "EXCLUSIVE");
            return m;
        }).toList();

        return ResponseEntity.ok((List) result);
    }

    /**
     * Lấy voucher trong ví theo id và kiểm tra có thể áp dụng với cartTotal không
     */
    @GetMapping("/wallet/{voucherId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy voucher trong ví theo id với kiểm tra điều kiện")
    public ResponseEntity<AvailableVoucherDTO> getWalletVoucherById(
            @PathVariable String voucherId,
            @RequestParam double cartTotal,
            Authentication auth) {
        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        AvailableVoucherDTO dto = discountCodeService.getWalletVoucherById(customer, voucherId, cartTotal);
        return ResponseEntity.ok(dto);
    }

    /**
     * Đánh dấu voucher trong ví đã dùng sau khi thanh toán thành công.
     * - Ship COD: gọi ngay khi khách xác nhận đơn.
     * - Momo/VNPay: gọi sau khi gateway xác nhận thanh toán.
     */
    @PostMapping("/wallet/{voucherId}/mark-used")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Đánh dấu voucher trong ví đã dùng sau khi thanh toán thành công")
    public ResponseEntity<?> markWalletVoucherUsed(
            @PathVariable String voucherId,
            @RequestParam String orderId,
            Authentication auth) {
        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        try {
            discountCodeService.markWalletVoucherUsed(customer, voucherId, orderId);
            return ResponseEntity.ok(new Object() {
                public String voucherId_ret = voucherId;
                public String orderId_ret = orderId;
                public String message = "✓ Cập nhật voucher đã dùng thành công";
            });
        } catch (RuntimeException e) {
            log.error("Mark wallet voucher used failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new Object() {
                public String error = e.getMessage();
            });
        }
    }
}
