package iuh.fit.backend.repository;

import iuh.fit.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByPhoneNumber(String phoneNumber);
    User findByUserId(String userId);
}
