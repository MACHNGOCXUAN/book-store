package iuh.fit.backend.service;

import java.util.List;
import java.util.Optional;

import iuh.fit.backend.model.Address;

public interface AddressService {
    
    /**
     * Lấy tất cả địa chỉ của customer
     */
    List<Address> getAddressesByCustomerId(String customerId);
    
    /**
     * Lấy địa chỉ mặc định của customer
     */
    Optional<Address> getDefaultAddress(String customerId);
    
    /**
     * Lấy địa chỉ theo ID
     */
    Optional<Address> getAddressById(Long addressId);
    
    /**
     * Thêm địa chỉ mới cho customer
     * Nếu là địa chỉ đầu tiên, tự động đặt làm mặc định
     */
    Address createAddress(String customerId, Address address);
    
    /**
     * Cập nhật địa chỉ
     */
    Address updateAddress(String customerId, Long addressId, Address address);
    
    /**
     * Xóa địa chỉ
     * Nếu xóa địa chỉ mặc định, tự động đặt địa chỉ khác làm mặc định
     */
    boolean deleteAddress(String customerId, Long addressId);
    
    /**
     * Đặt địa chỉ làm mặc định
     * Tự động bỏ mặc định các địa chỉ khác của customer
     */
    Address setDefaultAddress(String customerId, Long addressId);
}
