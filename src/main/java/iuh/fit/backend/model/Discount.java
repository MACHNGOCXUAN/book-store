package iuh.fit.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor @NoArgsConstructor
@Data
@Entity
@Table(name = "discounts")
public class Discount {
    @Id
    private String discountId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;


}
