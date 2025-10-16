package iuh.fit.backend.requests;

import lombok.Data;

@Data
public class ProductFilterDto {
    private String title;
    private String author;
    private Double minPrice;
    private Double maxPrice;
    private Integer page;
    private Integer limit;
}
