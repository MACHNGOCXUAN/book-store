package iuh.fit.backend.dto.requests;

import lombok.Data;

@Data
public class UserUpdateStatusDto {
    private String userId;
    private boolean status;
}
