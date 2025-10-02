package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
public abstract class User {
    @Id
    private String userId;

    private String userName;
    private String password;
    private String email;
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean status;
    private LocalDate registrationDate;
}
