package iuh.fit.backend.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request để đổi loyaltyPoints lấy voucher
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRewardRequestDTO {
    private String voucherId; // Discount code id
    private Integer pointsToSpend; // Số điểm muốn dùng (validate lại backend)
}
