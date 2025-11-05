package iuh.fit.backend.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.backend.dto.requests.UserFilter;
import iuh.fit.backend.dto.requests.UserUpdateStatusDto;
import iuh.fit.backend.model.Cart;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.enums.Role;
import iuh.fit.backend.repository.CartRepository;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.repository.UserRepository;
import iuh.fit.backend.service.CustomerService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ======================= CRUD CƠ BẢN =======================
    @Override
    public Customer findCustomerById(String id) {
        return customerRepository.findById(id).orElse(null);
    }

    @Override
    public List<Customer> findAllCustomers() {
        return customerRepository.findAll();
    }

    // ======================= SAVE (PHÁT SINH USER### + ENCODE PW)
    // =======================
    @Override
    @Transactional
    public Customer saveCustomer(Customer customer) {
        // 1) Chuẩn hóa dữ liệu
        customer.setRole(Role.CUSTOMER);
        if (customer.getPassword() != null && !customer.getPassword().isBlank()) {
            customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        }
        if (customer.getUserId() == null || customer.getUserId().isBlank()) {
            customer.setUserId(nextUserId());
        }

        // 2) Lưu Customer trước
        Customer saved = customerRepository.save(customer);

        // 3) Tạo Cart nếu chưa có (Cart là owning side → set customer rồi save cart)
        cartRepository.findByCustomerUserId(saved.getUserId()).orElseGet(() -> {
            Cart cart = new Cart();
            // phát sinh cartId thủ công
            String lastId = cartRepository.findMaxCartId();
            int nextNum = 1;
            if (lastId != null && lastId.startsWith("CART")) {
                try {
                    nextNum = Integer.parseInt(lastId.substring(4)) + 1;
                } catch (NumberFormatException ignored) {
                }
            }
            cart.setCartId("CART" + String.format("%03d", nextNum));
            cart.setCustomer(saved);
            cart.setCreatedDate(LocalDate.now());
            cart.recalcTotals();
            return cartRepository.save(cart);
        });

        // (tuỳ) đồng bộ 2 chiều trong Persistence Context
        // saved.setCart(cart); // Không bắt buộc vì mappedBy, chỉ để đồng bộ object
        // đang ở context

        return saved;
    }

    // Tạo mã mới dạng USER### dựa trên MAX(userId) hiện có
    private String nextUserId() {
        String lastId = userRepository.findMaxUserId(); // ví dụ: USER012
        int next = 1;
        if (lastId != null && lastId.startsWith("USER")) {
            try {
                next = Integer.parseInt(lastId.substring(4)) + 1;
            } catch (NumberFormatException ignored) {
                next = 1;
            }
        }
        return "USER" + String.format("%03d", next);
    }

    // ======================= FILTER/PAGING =======================
    @Override
    public Page<Customer> getCustomersFilter(UserFilter userFilter) {
        final String name = userFilter.getName() != null ? userFilter.getName().trim() : "";
        final String statusStr = userFilter.getStatus() != null ? userFilter.getStatus().trim() : "tat_ca";
        final int page = (userFilter.getPage() != null && userFilter.getPage() > 0) ? userFilter.getPage() - 1 : 0;
        final int limit = (userFilter.getLimit() != null && userFilter.getLimit() > 0) ? userFilter.getLimit() : 10;

        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();

            if (!name.isEmpty()) {
                preds.add(cb.like(cb.lower(root.get("userName")), "%" + name.toLowerCase() + "%"));
            }

            // So sánh enum Role.CUSTOMER
            preds.add(cb.equal(root.get("role"), Role.CUSTOMER));

            if (!"tat_ca".equalsIgnoreCase(statusStr)) {
                boolean status = "hoat_dong".equalsIgnoreCase(statusStr);
                preds.add(cb.equal(root.get("status"), status));
            }

            return cb.and(preds.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.ASC, "userName"));
        return customerRepository.findAll(spec, pageable);
    }

    // ======================= DELETE =======================
    @Override
    @Transactional
    public boolean deleteCustomerById(String id) {
        if (!customerRepository.existsById(id))
            return false;
        customerRepository.deleteById(id);
        return true;
    }

    // ======================= TÌM THEO PHONE =======================
    @Override
    public List<Customer> findCustomerByPhone(String phone) {
        return customerRepository.findByPhoneNumber(phone);
    }

    // ======================= UPDATE STATUS =======================
    @Override
    @Transactional
    public boolean updateCustomerStatus(UserUpdateStatusDto dto) {
        try {
            Customer customer = customerRepository.findById(dto.getUserId()).orElse(null);
            if (customer == null) {
                log.warn("Không tìm thấy khách hàng với userId={}", dto.getUserId());
                return false;
            }
            customer.setStatus(dto.isStatus());
            customerRepository.save(customer);
            return true;
        } catch (Exception e) {
            log.error("updateCustomerStatus failed", e);
            return false;
        }
    }

    // ======================= UPDATE PROFILE WITH GENDER & DATE OF BIRTH
    // =======================
    @Transactional
    public Customer updateCustomerProfile(String userId, String fullName, String email, String phone, String gender,
            String dateOfBirth) {
        try {
            Customer customer = customerRepository.findById(userId).orElse(null);
            if (customer == null) {
                log.warn("Không tìm thấy khách hàng với userId={}", userId);
                return null;
            }

            if (fullName != null && !fullName.isBlank()) {
                customer.setFullName(fullName);
            }
            if (email != null && !email.isBlank()) {
                customer.setEmail(email);
            }
            if (phone != null && !phone.isBlank()) {
                customer.setPhoneNumber(phone);
            }
            if (gender != null && !gender.isBlank()) {
                try {
                    customer.setGender(iuh.fit.backend.model.enums.Gender.valueOf(gender.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid gender value: {}", gender);
                }
            }
            if (dateOfBirth != null && !dateOfBirth.isBlank()) {
                try {
                    customer.setDateOfBirth(java.time.LocalDate.parse(dateOfBirth));
                    log.info("Successfully parsed dateOfBirth: {}", dateOfBirth);
                } catch (java.time.format.DateTimeParseException e) {
                    log.warn("Invalid dateOfBirth format: {} - Error: {}", dateOfBirth, e.getMessage());
                }
            }

            Customer saved = customerRepository.save(customer);
            System.out.println("=== SAVE RESULT ===");
            System.out.println("Saved customer: " + saved);
            System.out.println("Saved gender: " + saved.getGender());
            System.out.println("Saved dateOfBirth: " + saved.getDateOfBirth());
            return saved;
        } catch (Exception e) {
            System.out.println("=== SAVE ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            log.error("updateCustomerProfile with gender and dateOfBirth failed", e);
            return null;
        }
    }

    // ======================= CHANGE PASSWORD =======================
    @Override
    @Transactional
    public boolean changePassword(String customerId, String currentPassword, String newPassword) {
        try {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) {
                log.warn("Không tìm thấy khách hàng với userId={}", customerId);
                return false;
            }

            // Kiểm tra mật khẩu hiện tại
            if (!passwordEncoder.matches(currentPassword, customer.getPassword())) {
                log.warn("Mật khẩu hiện tại không đúng cho userId={}", customerId);
                return false;
            }

            // Cập nhật mật khẩu mới
            customer.setPassword(passwordEncoder.encode(newPassword));
            customerRepository.save(customer);
            log.info("Đổi mật khẩu thành công cho userId={}", customerId);
            return true;
        } catch (Exception e) {
            log.error("changePassword failed", e);
            return false;
        }
    }
}
