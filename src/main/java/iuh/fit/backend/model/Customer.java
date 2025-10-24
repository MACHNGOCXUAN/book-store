package iuh.fit.backend.model;

import jakarta.persistence.*;
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

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Cart cart;   // KHÔNG dùng @JoinColumn ở đây

}
