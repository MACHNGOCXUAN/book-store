package iuh.fit.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter @ToString
@Entity @Table(name = "reviews")
public class Review {
    @Id
    private String reviewId;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private int rating;             // 1..5
    @Column(length = 2000)
    private String content;
    private LocalDate ratingDate;
}
