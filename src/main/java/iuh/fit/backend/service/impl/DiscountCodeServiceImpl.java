package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.DiscountCode;
import iuh.fit.backend.repository.DiscountCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountCodeServiceImpl implements iuh.fit.backend.service.DiscountCodeService {
    private final DiscountCodeRepository discountCodeRepository;
    public List<DiscountCode> findAll() {
        return discountCodeRepository.findAll();
    }
}
