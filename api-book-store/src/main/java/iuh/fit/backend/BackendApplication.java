package iuh.fit.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@EnableJpaAuditing

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Mật khẩu mã hoá: " + encoder.encode("Huynh12345"));
    }

}
