package iuh.fit.backend.dto.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopBookDto {
    @JsonProperty("book_id")
    private String bookId;

    @JsonProperty("book_title")
    private String bookTitle;

    @JsonProperty("book_author")
    private String bookAuthor;

    @JsonProperty("book_cover")
    private String bookCover;

    @JsonProperty("avg_rating")
    private Double avgRating;

    @JsonProperty("review_count")
    private Long reviewCount;

    @JsonProperty("price")
    private Double price;

    @JsonProperty("discount_percent")
    private Integer discountPercent;

    @JsonProperty("stock")
    private Integer stock;
}
