package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.User;
import iuh.fit.backend.repository.UserRepository;
import iuh.fit.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User findUserById(String id) {
        return userRepository.findByUserId(id);
    }

    @Override
    public Optional<User> findUserByPhone(String phone) {
        return userRepository.findByPhoneNumber(phone);
    }
}
