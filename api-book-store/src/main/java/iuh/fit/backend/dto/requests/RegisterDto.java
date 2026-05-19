package iuh.fit.backend.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RegisterDto {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String address;
    private String dateOfBirth; // ISO yyyy-MM-dd expected
}
