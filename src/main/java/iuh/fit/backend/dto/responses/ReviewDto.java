package iuh.fit.backend.dto.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    @JsonProperty("review_id")
    private String reviewId;

    @JsonProperty("book_id")
    private String bookId;

    @JsonProperty("book_title")
    private String bookTitle;

    @JsonProperty("customer_id")
    private String customerId;

    @JsonProperty("customer_name")
    private String customerName;

    @JsonProperty("customer_full_name")
    private String customerFullName;

    private int rating;
    private String content;

    @JsonProperty("rating_date")
    private LocalDate ratingDate;
}
