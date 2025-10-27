package iuh.fit.backend.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressRequestDto {
    private String receiverName;
    private String receiverPhone;
    private String province;
    private String district;
    private String ward;
    private String specifics;
    private Integer main; 
}
