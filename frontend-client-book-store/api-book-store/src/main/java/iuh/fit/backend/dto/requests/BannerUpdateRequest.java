package iuh.fit.backend.dto.requests;

import lombok.Data;

@Data
public class BannerUpdateRequest {
    private String title;
    private Integer displayOrder;
    private Boolean isVisible;
    private String url;
}
