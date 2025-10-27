package iuh.fit.backend.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.backend.model.Address;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.repository.AddressRepository;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.service.AddressService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    @Override
    public List<Address> getAddressesByCustomerId(String customerId) {
        return addressRepository.findByCustomerUserId(customerId);
    }

    @Override
    public Optional<Address> getDefaultAddress(String customerId) {
        return addressRepository.findByCustomerUserIdAndMainEquals(customerId, 1);
    }

    @Override
    public Optional<Address> getAddressById(Long addressId) {
        return addressRepository.findById(addressId);
    }

    @Override
    public Address createAddress(String customerId, Address address) {
        // Kiểm tra customer có tồn tại không
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));
        
        address.setCustomer(customer);
        
        long addressCount = addressRepository.countByCustomerUserId(customerId);
        if (addressCount == 0) {
            address.setMain(1); 
        } else {
            if (address.getMain() == 1) {
                addressRepository.setAllAddressesNotMain(customerId);
            } else {
                address.setMain(0);
            }
        }
        
        return addressRepository.save(address);
    }

    @Override
    public Address updateAddress(String customerId, Long addressId, Address updatedAddress) {
        // Kiểm tra địa chỉ có thuộc về customer không
        Address existingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ với ID: " + addressId));
        
        if (!existingAddress.getCustomer().getUserId().equals(customerId)) {
            throw new RuntimeException("Địa chỉ này không thuộc về khách hàng này");
        }
        
        // Cập nhật thông tin địa chỉ (không cập nhật main ở đây)
        existingAddress.setReceiverName(updatedAddress.getReceiverName());
        existingAddress.setReceiverPhone(updatedAddress.getReceiverPhone());
        existingAddress.setProvince(updatedAddress.getProvince());
        existingAddress.setDistrict(updatedAddress.getDistrict());
        existingAddress.setWard(updatedAddress.getWard());
        existingAddress.setSpecifics(updatedAddress.getSpecifics());
        
        return addressRepository.save(existingAddress);
    }

    @Override
    public boolean deleteAddress(String customerId, Long addressId) {
        // Kiểm tra địa chỉ có thuộc về customer không
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ với ID: " + addressId));
        
        if (!address.getCustomer().getUserId().equals(customerId)) {
            throw new RuntimeException("Địa chỉ này không thuộc về khách hàng này");
        }
        
        boolean wasMain = address.getMain() == 1;
        addressRepository.delete(address);
        
        // Nếu xóa địa chỉ mặc định, tự động đặt địa chỉ khác làm mặc định
        if (wasMain) {
            List<Address> remainingAddresses = addressRepository.findByCustomerUserId(customerId);
            if (!remainingAddresses.isEmpty()) {
                Address newMainAddress = remainingAddresses.get(0);
                newMainAddress.setMain(1);
                addressRepository.save(newMainAddress);
            }
        }
        
        return true;
    }

    @Override
    public Address setDefaultAddress(String customerId, Long addressId) {
        // Kiểm tra địa chỉ có thuộc về customer không
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ với ID: " + addressId));
        
        if (!address.getCustomer().getUserId().equals(customerId)) {
            throw new RuntimeException("Địa chỉ này không thuộc về khách hàng này");
        }
        
        addressRepository.setAllAddressesNotMain(customerId);
    
        address.setMain(1);
        return addressRepository.save(address);
    }
}
