package iuh.fit.backend.controller;

import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.service.DiscountCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountCodeController {
    private final DiscountCodeService discountCodeService;

    @GetMapping
    public ResponseEntity<List<DiscountCode>> getAllDiscountCodes() {
        System.out.println(discountCodeService.findAll());
        return ResponseEntity.ok(discountCodeService.findAll());
    }
}
