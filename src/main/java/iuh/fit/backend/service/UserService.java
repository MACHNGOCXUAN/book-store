package iuh.fit.backend.service;

import iuh.fit.backend.model.User;

public interface UserService {
    User findUserById(String id);
}
