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
@Table(name = "discount_codes")
public class DiscountCode {
    @Id
    private String discountId;
    private String name;
    private int percent;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
}
