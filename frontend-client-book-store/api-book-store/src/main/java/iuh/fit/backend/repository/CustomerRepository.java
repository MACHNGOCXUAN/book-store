package iuh.fit.backend.repository;

import iuh.fit.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, String>, JpaSpecificationExecutor<Customer> {

    List<Customer> findByPhoneNumber(String phoneNumber);
    Optional<Customer> findByUserId(String userId);
    // Removed invalid JPQL method that referenced a non-existing 'address'
    // attribute on Customer.
    // Address is a collection on Customer (`addresses`) and updates should be done
    // via AddressRepository or
    // by loading the Customer and modifying the addresses collection in service
    // layer.

}
