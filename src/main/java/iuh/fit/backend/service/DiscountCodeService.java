package iuh.fit.backend.service;

import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.enums.DiscountType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface DiscountCodeService {
    List<DiscountCode> findAll();
    List<DiscountCode> filterDiscountCode(String code, DiscountType type, String description);
    DiscountCode save(DiscountCode discountCode);
    DiscountCode findById(String id);
}
