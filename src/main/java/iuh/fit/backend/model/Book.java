package iuh.fit.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter @ToString
@Entity @Table(name = "books")
public class Book {
    @Id
    private String bookId;
    @Column(columnDefinition = "MEDIUMTEXT")
    private String title;
    private String author;
    private String publisher;
    private String category;
    private double price;
    private double importPrice;
    private int stock;
    private int discountPercent;
    @Column(columnDefinition = "MEDIUMTEXT")
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

    @ManyToMany(mappedBy = "favoriteBooks")
    @JsonIgnore
    private Set<Customer> likedByCustomers = new HashSet<>();
}
