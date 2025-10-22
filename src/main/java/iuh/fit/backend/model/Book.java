package iuh.fit.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter @ToString
@Entity @Table(name = "books")
public class Book {
    @Id
    private String bookId;

    private String title;
    private String author;
    private String publisher;
    private String category;
    private double price;
    private int stockQuantity;
    private int soldQuantity;
    private int discountPercent;
    @Column(length = 2000)
    private String description;
    private LocalDate publishDate;

    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String coverImage;

    // Relations
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    // ngăn lặp vô hạn
    @JsonIgnore
    @ToString.Exclude
    private List<OrderDetail> orderDetails;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private List<Review> reviews;
}
