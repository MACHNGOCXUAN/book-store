package iuh.fit.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.backend.model.Address;
import iuh.fit.backend.service.AddressService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@CrossOrigin
public class AddressController {

    private final AddressService addressService;

    /**
     * Lấy tất cả địa chỉ của customer
     * GET /api/addresses/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Address>> getAddressesByCustomer(@PathVariable String customerId) {
        try {
            List<Address> addresses = addressService.getAddressesByCustomerId(customerId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy địa chỉ mặc định của customer
     * GET /api/addresses/customer/{customerId}/default
     */
    @GetMapping("/customer/{customerId}/default")
    public ResponseEntity<Address> getDefaultAddress(@PathVariable String customerId) {
        try {
            return addressService.getDefaultAddress(customerId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy địa chỉ theo ID
     * GET /api/addresses/{addressId}
     */
    @GetMapping("/{addressId}")
    public ResponseEntity<Address> getAddressById(@PathVariable Long addressId) {
        try {
            return addressService.getAddressById(addressId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Thêm địa chỉ mới cho customer
     * POST /api/addresses/customer/{customerId}
     * Body: Address object
     */
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<?> createAddress(@PathVariable String customerId, @RequestBody Address address) {
        try {
            Address createdAddress = addressService.createAddress(customerId, address);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAddress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tạo địa chỉ");
        }
    }

    /**
     * Cập nhật địa chỉ
     * PUT /api/addresses/customer/{customerId}/{addressId}
     * Body: Address object
     */
    @PutMapping("/customer/{customerId}/{addressId}")
    public ResponseEntity<?> updateAddress(
            @PathVariable String customerId,
            @PathVariable Long addressId,
            @RequestBody Address address) {
        try {
            Address updatedAddress = addressService.updateAddress(customerId, addressId, address);
            return ResponseEntity.ok(updatedAddress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi cập nhật địa chỉ");
        }
    }

    /**
     * Xóa địa chỉ
     * DELETE /api/addresses/customer/{customerId}/{addressId}
     */
    @DeleteMapping("/customer/{customerId}/{addressId}")
    public ResponseEntity<?> deleteAddress(
            @PathVariable String customerId,
            @PathVariable Long addressId) {
        try {
            boolean deleted = addressService.deleteAddress(customerId, addressId);
            if (deleted) {
                return ResponseEntity.ok("Xóa địa chỉ thành công");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi xóa địa chỉ");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi xóa địa chỉ");
        }
    }

    /**
     * Đặt địa chỉ làm mặc định
     * PUT /api/addresses/customer/{customerId}/{addressId}/set-default
     */
    @PutMapping("/customer/{customerId}/{addressId}/set-default")
    public ResponseEntity<?> setDefaultAddress(
            @PathVariable String customerId,
            @PathVariable Long addressId) {
        try {
            Address address = addressService.setDefaultAddress(customerId, addressId);
            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi đặt địa chỉ mặc định");
        }
    }
}
