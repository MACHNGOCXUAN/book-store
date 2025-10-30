package iuh.fit.backend.dto.requests;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookCreateDTO {
    private String bookId;
    private String title;
    private String author;
    private double price;
    private double importPrice;
    private int stock;
    private String publisher;
    private LocalDate publishDate;
    private String category_id;
    private String coverImage;
    private String description;
    private int discountPercent;
}
