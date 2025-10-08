package iuh.fit.backend.requests;

import lombok.Data;

@Data
public class StaffUpdateStatusDto {
    private String userId;
    private boolean status;
}
