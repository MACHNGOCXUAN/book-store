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

		// Thử tìm user bằng phone number trước
		User user = userRepository.findByPhoneNumber(username).orElse(null);

		// Nếu không tìm thấy, thử tìm bằng email
		if (user == null) {
			user = userRepository.findByEmail(username).orElse(null);
		}

		// Nếu vẫn không tìm thấy, ném exception
		if (user == null) {
			throw new UsernameNotFoundException("User not found with phone or email: " + username);
		}

		// return org.springframework.security.core.userdetails.User
		// .withUsername(user.getPhoneNumber())
		// .password(user.getPassword())
		// .authorities("USER")
		// .build();

		return new CustomUserDetail(user);
	}
}