package iuh.fit.backend.controller;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.dto.requests.ExchangeRewardRequestDTO;
import iuh.fit.backend.dto.responses.ExchangeableVoucherDTO;
import iuh.fit.backend.dto.responses.ExchangeRewardResponseDTO;
import iuh.fit.backend.service.RewardExchangeService;
import iuh.fit.backend.repository.CustomerRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Luồng B - Đổi Loyalty Points lấy Mã Giảm Giá
 */
@RestController
@RequestMapping("/api/rewards")
@Tag(name = "Reward Exchange", description = "API đổi điểm lấy voucher")
@RequiredArgsConstructor
@Slf4j
public class RewardExchangeController {

    private final RewardExchangeService rewardExchangeService;
    private final CustomerRepository customerRepository;

    /**
     * Lấy danh sách voucher có thể đổi
     */
    @GetMapping("/exchangeable-vouchers")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy danh sách voucher có thể đổi bằng điểm")
    public ResponseEntity<List<ExchangeableVoucherDTO>> getExchangeableVouchers(Authentication auth) {
        log.info("Getting exchangeable vouchers for user: {}", auth.getName());

        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<ExchangeableVoucherDTO> vouchers = rewardExchangeService.getExchangeableVouchers(customer);
        return ResponseEntity.ok(vouchers);
    }

    /**
     * Đổi điểm lấy voucher
     */
    @PostMapping("/exchange")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Đổi loyaltyPoints lấy voucher")
    public ResponseEntity<?> exchangeReward(
            @RequestBody ExchangeRewardRequestDTO request,
            Authentication auth) {
        log.info("Exchanging reward for user: {} with voucher: {}", auth.getName(), request.getVoucherId());

        Customer customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        try {
            ExchangeRewardResponseDTO response = rewardExchangeService.exchangeReward(customer, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Exchange failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new Object() {
                public String error = e.getMessage();
            });
        }
    }
}
