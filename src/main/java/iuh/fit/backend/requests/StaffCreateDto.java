package iuh.fit.backend.requests;

import lombok.Data;

@Data
public class StaffCreateDto {
    private String id;
    private String userName;
    private String email;
    private String phoneNumber;
    private boolean status;
    private String password;
    private String shift;
    private String department;
}
