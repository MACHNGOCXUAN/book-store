package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.ChatSession;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.Staff;
import iuh.fit.backend.model.enums.Gender;
import iuh.fit.backend.model.enums.Role;
import iuh.fit.backend.repository.ChatSessionRepository;
import iuh.fit.backend.repository.StaffRepository;
import iuh.fit.backend.repository.UserRepository;
import iuh.fit.backend.dto.requests.StaffCreateDto;
import iuh.fit.backend.dto.requests.UserUpdateStatusDto;
import iuh.fit.backend.dto.requests.UserFilter;
import iuh.fit.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChatSessionRepository chatSessionRepository;

    @Override
    public Staff getStaffById(String staffId) {
        return staffRepository.findById(staffId).orElse(null);
    }

    @Override
    public ArrayList<Staff> getAllStaff() {
        return null;
    }

    @Override
    public Page<Staff> getStaffsFilter(UserFilter userFilter) {
        String name = userFilter.getName() != null ? userFilter.getName() : "";
        String statusStr = userFilter.getStatus() != null ? userFilter.getStatus() : "tat_ca";
        int page = userFilter.getPage() != null ? userFilter.getPage() - 1 : 0;
        int limit = userFilter.getLimit() != null ? userFilter.getLimit() : 10;

        Specification<Staff> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (!name.isEmpty()) {
                predicates.add(cb.like(root.get("fullName"), "%" + name + "%"));
            }

            predicates.add((cb.equal(root.get("role"), "STAFF")));

            if (!statusStr.equals("tat_ca")) {
                boolean status = statusStr.equals("hoat_dong");
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return staffRepository.findAll(spec, PageRequest.of(page, limit, Sort.by("userId").descending()));
    }

    @Override
    public boolean addStaff(StaffCreateDto staffInput) {
        try {
            Staff staff = new Staff();
            if (staff.getUserId() == null || staff.getUserId().isEmpty()) {
                // Lấy mã lớn nhất hiện có trong DB
                String lastId = userRepository.findMaxUserId(); // Sẽ viết hàm này trong repository
                System.out.println("Last id" + lastId);
                int nextNum = 1; // mặc định nếu chưa có dữ liệu nào
                if (lastId != null && lastId.startsWith("USER")) {
                    try {
                        nextNum = Integer.parseInt(lastId.substring(4)) + 1;
                    } catch (NumberFormatException e) {
                        // fallback nếu format lỗi
                        nextNum = 1;
                    }
                }

                String newId = "USER" + String.format("%03d", nextNum);
                staff.setUserId(newId);
            }
            staff.setFullName(staffInput.getFullName());
            staff.setGender(Gender.valueOf(String.valueOf(staffInput.getGender())));
            staff.setEmail(staffInput.getEmail());
            staff.setPhoneNumber(staffInput.getPhoneNumber());
            staff.setShift(staffInput.getShift());
            staff.setDateOfBirth(staffInput.getDateOfBirth());

            staff.setDepartment(
                    staffInput.getDepartment() != null ? staffInput.getDepartment() : "Support"
            );

            staff.setRole(Role.STAFF);
            staff.setStatus(true);

            staff.setRegistrationDate(LocalDate.now());
            staff.setPassword(passwordEncoder.encode(staffInput.getPassword()));
            staffRepository.save(staff);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean updateStaff(StaffCreateDto staffCreateDto) {
        try {
            Staff staff = staffRepository.findById(staffCreateDto.getId()).orElse(null);
            if(staff == null) {
                System.out.println("Khoong tim thay nhan vien: " + staffCreateDto.getId());
                return false;
            }

            staff.setFullName(staffCreateDto.getFullName());
            staff.setGender(Gender.valueOf(String.valueOf(staffCreateDto.getGender())));
            staff.setDateOfBirth(staffCreateDto.getDateOfBirth());
            staff.setEmail(staffCreateDto.getEmail());
            staff.setPhoneNumber(staffCreateDto.getPhoneNumber());
            staff.setDepartment(staffCreateDto.getDepartment());
            staff.setShift(staffCreateDto.getShift());
            staff.setStatus(staffCreateDto.isStatus());

            if (staffCreateDto.getPassword() != null && !staffCreateDto.getPassword().isEmpty()) {
                staff.setPassword(passwordEncoder.encode(staffCreateDto.getPassword()));
            }

            staffRepository.save(staff);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteStaff(String staffId) {
        if (staffRepository.findById(staffId).isPresent()) {
            staffRepository.deleteById(staffId);
            return true;
        }
        return false;
    }

    @Override
    public boolean updateStatusStaff(UserUpdateStatusDto staffUpdateStatusDto) {
        try {
            Staff staff = staffRepository.findById(staffUpdateStatusDto.getUserId()).orElse(null);
            if(staff == null) {
                System.out.println("Khoong tim thay nhan vien: " + staffUpdateStatusDto.getUserId());
                return false;
            }
            staff.setStatus(staffUpdateStatusDto.isStatus());

            staffRepository.save(staff);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<ChatSession> getSessionsByStaffId(String staffId) {
        return chatSessionRepository.findActiveSessionsByStaffId(staffId);
    }

    @Override
    public List<ChatSession> getCustomersChattingWithStaff(String staffId) {
        List<ChatSession> chatSessions = chatSessionRepository.findActiveSessionsByStaffId(staffId);

        List<Customer> customersChattingWithStaff = new ArrayList<>();
        for (ChatSession chatSession : chatSessions) {
            customersChattingWithStaff.add(chatSession.getCustomer());
        }
        return chatSessions;
    }

    @Override
    public List<ChatSession> getStaffsChattingWithCustomer(String customerId) {
        List<ChatSession> chatSessions = chatSessionRepository.findCustomerActiveSessionsByStaffId(customerId);
        return chatSessions;
    }

}