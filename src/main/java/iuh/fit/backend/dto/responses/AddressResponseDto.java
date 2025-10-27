package iuh.fit.backend.dto.responses;

import iuh.fit.backend.model.Address;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressResponseDto {
    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String province;
    private String district;
    private String ward;
    private String specifics;
    private boolean isMain; 

    public static AddressResponseDto fromAddress(Address address) {
        return AddressResponseDto.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .specifics(address.getSpecifics())
                .isMain(address.getMain() == 1)
                .build();
    }
}
