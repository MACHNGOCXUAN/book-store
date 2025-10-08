package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.Staff;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.requests.UserFilter;
import iuh.fit.backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;

    @Override
    public Customer findCustomerById(String id) {
        return null;
    }

    @Override
    public List<Customer> findAllCustomers() {
        return List.of();
    }

    @Override
    public Customer saveCustomer(Customer customer) {
        return null;
    }

    @Override
    public Page<Customer> getCustomersFilter(UserFilter userFilter) {
        String name = userFilter.getName() != null ? userFilter.getName() : "";
//        String statusStr = userFilter.getStatus() != null ? userFilter.getStatus() : "tat_ca";
        int page = userFilter.getPage() != null ? userFilter.getPage() - 1 : 0;
        int limit = userFilter.getLimit() != null ? userFilter.getLimit() : 10;

        Specification<Customer> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (!name.isEmpty()) {
                predicates.add(cb.like(root.get("userName"), "%" + name + "%"));
            }

            predicates.add((cb.equal(root.get("role"), "CUSTOMER")));

//            if (!statusStr.equals("tat_ca")) {
//                boolean status = statusStr.equals("hoat_dong");
//                predicates.add(cb.equal(root.get("status"), status));
//            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return customerRepository.findAll(spec, PageRequest.of(page, limit, Sort.by("userName").ascending()));
    }
}
