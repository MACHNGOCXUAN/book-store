package iuh.fit.backend.dto.requests;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {
    @NotBlank(message = "Book ID cannot be blank")
    private String bookId;

    @NotBlank(message = "Customer ID cannot be blank")
    private String customerId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating;

    @NotBlank(message = "Content cannot be blank")
    @Size(min = 10, max = 2000, message = "Content must be between 10 and 2000 characters")
    private String content;
}
