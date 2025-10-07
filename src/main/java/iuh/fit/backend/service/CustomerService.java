package iuh.fit.backend.service;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.requests.UserFilter;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CustomerService {
    Customer findCustomerById(String id);
    List<Customer> findAllCustomers();
    Customer saveCustomer(Customer customer);
    Page<Customer> getCustomersFilter(UserFilter userFilter);
}
