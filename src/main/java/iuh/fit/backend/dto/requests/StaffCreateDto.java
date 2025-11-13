package iuh.fit.backend.dto.requests;

import iuh.fit.backend.model.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StaffCreateDto {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private boolean status;
    private String password;
    private String shift;
    private String department;
    private Gender gender;
    private LocalDate dateOfBirth;
}
