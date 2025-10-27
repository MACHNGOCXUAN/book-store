package iuh.fit.backend.service;

import iuh.fit.backend.model.DiscountCode;

import java.util.List;

public interface DiscountCodeService {
    List<DiscountCode> findAll();
}
