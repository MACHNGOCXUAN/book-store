package iuh.fit.backend.controller;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.service.DiscountCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountCodeController {
    private final DiscountCodeService discountCodeService;

//    @GetMapping
//    public ResponseEntity<List<DiscountCode>> getAllDiscountCodes() {
//        System.out.println(discountCodeService.findAll());
//        return ResponseEntity.ok(discountCodeService.findAll());
//    }

    @GetMapping
    public ResponseEntity<List<DiscountCode>> filterDiscountCodes(@RequestParam(name = "discountCode", required = false) String discountCode,
                                                                  @RequestParam(name = "type", required = false) DiscountType type,
                                                                  @RequestParam(name = "description", required = false) String description) {
        System.out.println(discountCodeService.filterDiscountCode(discountCode, type, description));
        return ResponseEntity.ok(discountCodeService.filterDiscountCode(discountCode, type, description));
    }

    @PostMapping
    public ResponseEntity<DiscountCode> createDiscount(@RequestBody DiscountCode discountCode) {
        DiscountCode savedDiscount = discountCodeService.save(discountCode);
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
        return ResponseEntity.ok(updatedDiscount);
    }

}
