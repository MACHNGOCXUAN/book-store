package iuh.fit.backend.dto.requests;

import lombok.Data;

@Data
public class ArticleRequest {
    private String title;
    private String content;
    private String thumbnailUrl;
    private String createdById;
    private String updatedById;
    private Boolean isVisible;
}
