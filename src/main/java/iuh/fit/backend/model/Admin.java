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
@DiscriminatorValue("ADMIN")
public class Admin extends User {
    private String position;
    // Admin = quyền cao nhất
}
