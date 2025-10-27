package iuh.fit.backend.security;

import iuh.fit.backend.model.User;
import iuh.fit.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// username ở đây thực ra là userId (vì chúng ta đã thay đổi JWT để sử dụng
		// userId)
		// Tìm user bằng userId trước
		User user = userRepository.findById(username).orElse(null);

		if (user != null) {
			return new CustomUserDetail(user);
		}

		// Backward compatibility: nếu không tìm thấy bằng userId, thử tìm bằng phone
		user = userRepository.findByPhoneNumber(username).orElse(null);

		// Nếu không tìm thấy, thử tìm bằng email
		if (user == null) {
			user = userRepository.findByEmail(username).orElse(null);
		}

		// Nếu vẫn không tìm thấy, ném exception
		if (user == null) {
			throw new UsernameNotFoundException("User not found with id, phone or email: " + username);
		}

		return new CustomUserDetail(user);
	}
}