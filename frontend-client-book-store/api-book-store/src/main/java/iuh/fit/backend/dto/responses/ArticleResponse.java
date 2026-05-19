package iuh.fit.backend.dto.responses;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArticleResponse {
    private String articleId;
    private String title;
    private String content;
    private String thumbnailUrl;

    private String createdBy;
    private String updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isVisible;

}