package iuh.fit.backend.service;

import iuh.fit.backend.model.User;

import java.util.Optional;

public interface UserService {
    User findUserById(String id);
    Optional<User> findUserByPhone(String phone);
}
