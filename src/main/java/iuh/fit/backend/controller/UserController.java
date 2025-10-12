package iuh.fit.backend.controller;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.Staff;
import iuh.fit.backend.model.User;
import iuh.fit.backend.requests.StaffCreateDto;
import iuh.fit.backend.requests.UserUpdateStatusDto;
import iuh.fit.backend.requests.UserFilter;
import iuh.fit.backend.service.CustomerService;
import iuh.fit.backend.service.StaffService;
import iuh.fit.backend.service.UserService;
import iuh.fit.backend.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final StaffService staffService;
    private final CustomerService customerService;

    @GetMapping("admin/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }

        System.out.println("xua: " + authHeader);

        String token = authHeader.substring(7);
        System.out.println("xua5: " + token);
        String userId = jwtUtils.getUserIdFromToken(token);

        System.out.println("xua6: " + userId);

        User user = userService.findUserById(userId);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/admin/get-staff")
    public ResponseEntity<?> getStaffs(@RequestBody UserFilter request) {
        Page<Staff> pageStaff = staffService.getStaffsFilter(request);
        List<Staff> staffList = pageStaff.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("data", staffList);

        Map<String, Object> paging = new HashMap<>();
        paging.put("curPage", pageStaff.getNumber() + 1);
        paging.put("limitPage", pageStaff.getSize());
        paging.put("totalRows", pageStaff.getTotalElements());
        paging.put("totalPage", pageStaff.getTotalPages());

        response.put("paging", paging);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/get-customer")
    public ResponseEntity<?> getCustomers(@RequestBody UserFilter request) {
        Page<Customer> pageCustomer = customerService.getCustomersFilter(request);
        List<Customer> customerList = pageCustomer.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("data", customerList);

        Map<String, Object> paging = new HashMap<>();
        paging.put("curPage", pageCustomer.getNumber() + 1);
        paging.put("limitPage", pageCustomer.getSize());
        paging.put("totalRows", pageCustomer.getTotalElements());
        paging.put("totalPage", pageCustomer.getTotalPages());

        response.put("paging", paging);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/create-staff")
    public ResponseEntity<?> createStaff(@RequestBody StaffCreateDto request) {
        boolean success = staffService.addStaff(request);
        if(success) {
            return ResponseEntity.ok(Map.of("message", "Thêm nhân viên thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Thêm nhân viên thất bại"));
        }
    }

    @GetMapping("/admin/staff/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable String id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PutMapping("/admin/staff/update")
    public ResponseEntity<?> updateStaff(@RequestBody StaffCreateDto request) {
        boolean success = staffService.updateStaff(request);
        if(success) {
            return ResponseEntity.ok(Map.of("message", "Cập nhật nhân viên thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật nhân viên thất bại"));
        }
    }

    @PostMapping("/admin/staff/update-status")
    public ResponseEntity<?> updateStatusStaff(@RequestBody UserUpdateStatusDto request) {
        System.out.println("nk: " + request);
        boolean success = staffService.updateStatusStaff(request);
        if(success) {
            return ResponseEntity.ok(Map.of("message", "Cập nhật nhân viên thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật nhân viên thất bại"));
        }
    }

    @DeleteMapping("/admin/staff/{id}")
    public ResponseEntity<?> deleteStaffById(@PathVariable String id) {
        boolean success = staffService.deleteStaff(id);
        if(success) {
            return ResponseEntity.ok(Map.of("message", "Xóa nhân viên thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa nhân viên thất bại"));
        }
    }

    @DeleteMapping("/admin/customer/{id}")
    public ResponseEntity<?> deleteCustomerById(@PathVariable String id) {
        boolean success = customerService.deleteCustomerById(id);;
        if(success) {
            return ResponseEntity.ok(Map.of("message", "Xóa khách hàng thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa khách hàng thất bại"));
        }
    }

    @PostMapping("/admin/customer/search-phone")
    public ResponseEntity<?> searchPhone(@RequestBody String phone) {
        List<Customer> customerList = customerService.findCustomerByPhone(phone);
        Map<String, Object> response = new HashMap<>();
        response.put("data", customerList);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/customer/update-status")
    public ResponseEntity<?> updateStatusCustomer(@RequestBody UserUpdateStatusDto request) {
        boolean success = customerService.updateCustomerStatus(request);
        if(success) {
            return ResponseEntity.ok(Map.of("message", "Cập nhật khách hàng thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật khách hàng thất bại"));
        }
    }
}
