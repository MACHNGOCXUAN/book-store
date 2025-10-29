package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.model.enums.DiscountType;
import iuh.fit.backend.repository.DiscountCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DiscountCodeServiceImpl implements iuh.fit.backend.service.DiscountCodeService {
    private final DiscountCodeRepository discountCodeRepository;
    public List<DiscountCode> findAll() {
        return discountCodeRepository.findAll();
    }

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

    public DiscountCode save(DiscountCode discountCode){
        if (discountCode.getDiscountCodeId() == null || discountCode.getDiscountCodeId().isBlank()) {
            String prefix = "DC";
            int nextNum = (int) (discountCodeRepository.count() + 1);
            discountCode.setDiscountCodeId(prefix + String.format("%03d", nextNum));
        }
        return discountCodeRepository.save(discountCode);
    }

    public DiscountCode findById(String id){
        return discountCodeRepository.findById(id).orElse(null);
    }
}
