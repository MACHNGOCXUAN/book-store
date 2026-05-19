package iuh.fit.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import iuh.fit.backend.model.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    /**
     * Lấy tất cả địa chỉ của customer theo userId
     */
    List<Address> findByCustomerUserId(String customerId);
    
    /**
     * Lấy địa chỉ mặc định của customer
     */
    @Query("SELECT a FROM Address a WHERE a.customer.userId = :customerId AND a.main = 1")
    Optional<Address> findByCustomerUserIdAndMainEquals(@Param("customerId") String customerId, @Param("main") int main);
    
    /**
     * Đếm số lượng địa chỉ của customer
     */
    long countByCustomerUserId(String customerId);
    
    /**
     * Đặt tất cả địa chỉ của customer về không mặc định (main = 0)
     */
    @Modifying
    @Query("UPDATE Address a SET a.main = 0 WHERE a.customer.userId = :customerId")
    void setAllAddressesNotMain(@Param("customerId") String customerId);
}
