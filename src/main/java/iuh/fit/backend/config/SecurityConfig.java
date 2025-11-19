package iuh.fit.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import iuh.fit.backend.security.CustomUserDetailsService;
import iuh.fit.backend.security.JWTAthenticationEntryPoint;
import iuh.fit.backend.security.JWTAuthenticationFilter;


@Configuration
public class SecurityConfig {
    private final JWTAthenticationEntryPoint point;
    private final JWTAuthenticationFilter filter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(
            JWTAthenticationEntryPoint point,
            JWTAuthenticationFilter filter,
            CustomUserDetailsService userDetailsService
    ) {
        this.point = point;
        this.filter = filter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/chat/**",
                                "/api/reports/admin/**",
                                "/api/reports/staff/**",
                                "/api/reports/admin/overview",
                                "/api/reports/revenue",
                                "/api/reports/staff",
                                "/api/reports/orders",
                                "/api/reports/books",
                                "/api/reports/customers",
                                "/ws/**",
                                "/api/favorites/**",
                                "/api/books/**",
                                "/api/categories/**",
                                "/api/reviews/**",
                                "/api/messages/**",
                                "/api/banners/**",
                                "/api/discounts/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(point))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider());

        http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}