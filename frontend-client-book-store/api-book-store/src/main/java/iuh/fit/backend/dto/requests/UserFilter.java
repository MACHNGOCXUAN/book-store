package iuh.fit.backend.dto.requests;

import lombok.Data;
import lombok.Getter;

@Data
public class UserFilter {
    // Getters và setters
    private String name;
    private String status;
    private Integer page;
    private Integer limit;
}

