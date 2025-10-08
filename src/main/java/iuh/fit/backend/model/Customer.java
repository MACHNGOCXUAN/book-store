package iuh.fit.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(callSuper = true)
@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {
    private String fullName;
    private String address;
    private LocalDate dateOfBirth;
    private Integer loyaltyPoints;
}
