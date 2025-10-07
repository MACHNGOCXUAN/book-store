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
	public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {

		User user = userRepository.findByPhoneNumber(phone)
				.orElseThrow(() -> {
					return new UsernameNotFoundException("User not found: " + phone);
				});

//		return org.springframework.security.core.userdetails.User
//				.withUsername(user.getPhoneNumber())
//				.password(user.getPassword())
//				.authorities("USER")
//				.build();

		return new CustomUserDetail(user);
	}
}