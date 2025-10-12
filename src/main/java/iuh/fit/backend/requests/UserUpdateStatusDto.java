package iuh.fit.backend.requests;

import lombok.Data;

@Data
public class UserUpdateStatusDto {
    private String userId;
    private boolean status;
}
