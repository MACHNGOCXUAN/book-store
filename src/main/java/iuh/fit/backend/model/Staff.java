package iuh.fit.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(callSuper = true)
@Entity
@DiscriminatorValue("STAFF")
public class Staff extends User {
    private String department = "Support";  // luôn mặc định là Support
    private String shift;                   // ví dụ: Morning, Afternoon
}
