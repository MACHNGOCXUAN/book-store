package iuh.fit.backend.service;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.dto.requests.UserFilter;
import iuh.fit.backend.dto.requests.UserUpdateStatusDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CustomerService {
    Customer findCustomerById(String id);

    List<Customer> findAllCustomers();

    Customer saveCustomer(Customer customer);

    Page<Customer> getCustomersFilter(UserFilter userFilter);

    boolean deleteCustomerById(String id);

    List<Customer> findCustomerByPhone(String phone);

    boolean updateCustomerStatus(UserUpdateStatusDto customerUpdateStatusDto);

    Customer updateCustomerProfile(String userId, String fullName, String email, String phone);

    boolean changePassword(String customerId, String currentPassword, String newPassword);
}
