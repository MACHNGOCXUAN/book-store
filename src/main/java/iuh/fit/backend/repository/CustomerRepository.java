package iuh.fit.backend.repository;

import iuh.fit.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CustomerRepository extends JpaRepository<Customer,String> , JpaSpecificationExecutor<Customer> {
    
}
