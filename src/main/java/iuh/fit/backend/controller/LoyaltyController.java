package iuh.fit.backend.controller;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.dto.responses.LoyaltyInfoDTO;
import iuh.fit.backend.dto.responses.TierUpgradeNotificationDTO;
import iuh.fit.backend.service.LoyaltyService;
import iuh.fit.backend.repository.CustomerRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Luồng A - Tích điểm Loyalty
 */
@RestController
@RequestMapping("/api/loyalty")
@Tag(name = "Loyalty", description = "API quản lý tích điểm & tier")
@RequiredArgsConstructor
@Slf4j
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final CustomerRepository customerRepository;

    /**
     * Lấy thông tin loyalty của khách hàng hiện tại
     */
    @GetMapping("/info")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy thông tin loyalty của khách hàng")
    public ResponseEntity<LoyaltyInfoDTO> getLoyaltyInfo(Authentication auth) {
        log.info("Getting loyalty info for user: {}", auth.getName());
        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        LoyaltyInfoDTO info = loyaltyService.getLoyaltyInfo(customer);
        return ResponseEntity.ok(info);
    }

    /**
     * Admin endpoint - cộng điểm cho customer (debug/manual)
     */
    @PostMapping("/add-points/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Cộng điểm cho khách hàng (Admin)")
    public ResponseEntity<?> addPointsManual(
            @PathVariable String customerId,
            @RequestParam int points) {
        log.info("Adding {} points to customer: {}", points, customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        TierUpgradeNotificationDTO tierUpgrade = loyaltyService.addLoyaltyPointsFromOrder(customer, points * 10000);

        return ResponseEntity.ok(new Object() {
            public int newPoints = customer.getLoyaltyPoints();
            public String tier = customer.getTier().toString();
            public TierUpgradeNotificationDTO tierUpgradeInfo = tierUpgrade;
        });
    }
}
