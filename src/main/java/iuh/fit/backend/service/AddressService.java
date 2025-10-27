package iuh.fit.backend.service;

import java.util.List;
import java.util.Optional;

import iuh.fit.backend.model.Address;

public interface AddressService {

    List<Address> getAddressesByCustomerId(String customerId);

    Optional<Address> getDefaultAddress(String customerId);

    Optional<Address> getAddressById(Long addressId);

    Address createAddress(String customerId, Address address);
    
    Address updateAddress(String customerId, Long addressId, Address address);

    boolean deleteAddress(String customerId, Long addressId);
    
    Address setDefaultAddress(String customerId, Long addressId);
}
