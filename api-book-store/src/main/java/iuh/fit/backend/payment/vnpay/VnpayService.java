package iuh.fit.backend.payment.vnpay;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service để tạo payment URL từ VNPay
 */
@Service
@RequiredArgsConstructor
public class VnpayService {

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${payment.vnpay.pay-url}")
    private String payUrl;

    @Value("${payment.vnpay.return-url}")
    private String returnUrl;

    @Value("${payment.vnpay.curr-code}")
    private String currCode;

    @Value("${payment.vnpay.api-version}")
    private String apiVersion;

    /**
     * Tạo payment URL từ VNPay
     * 
     * @param orderId:  Mã đơn hàng
     * @param amount:   Số tiền (VND)
     * @param clientIp: IP của client
     * @return: URL thanh toán VNPay
     */
    public String createPaymentUrl(String orderId, long amount, String clientIp) {
        try {
            // Map để lưu các parameter
            Map<String, String> vnpParams = new TreeMap<>();

            vnpParams.put("vnp_Version", apiVersion);
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay tính bằng đơn vị x100
            vnpParams.put("vnp_CurrCode", currCode);
            vnpParams.put("vnp_TxnRef", orderId);
            vnpParams.put("vnp_OrderInfo", "Thanh toan don hang: " + orderId);
            vnpParams.put("vnp_OrderType", "order");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_IpAddr", clientIp);
            vnpParams.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

            // Tạo query string
            String queryString = vnpParams.entrySet().stream()
                    .map(e -> {
                        try {
                            return e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8.toString());
                        } catch (UnsupportedEncodingException ex) {
                            throw new RuntimeException(ex);
                        }
                    })
                    .collect(Collectors.joining("&"));

            // Tạo secure hash
            String secureHash = generateSecureHash(queryString);

            // Thêm secure hash vào URL
            String paymentUrl = payUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;

            System.out.println("✅ Payment URL created: " + paymentUrl.substring(0, 100) + "...");
            return paymentUrl;
        } catch (Exception e) {
            System.err.println("❌ Error creating payment URL: " + e.getMessage());
            throw new RuntimeException("Failed to create payment URL", e);
        }
    }

    /**
     * Xác thực secure hash từ VNPay
     * 
     * @param params: Map của tất cả parameters từ VNPay return
     * @return: true nếu signature hợp lệ
     */
    public boolean verifySignature(Map<String, String> params) {
        try {
            String secureHash = params.get("vnp_SecureHash");

            // Xóa secure hash và command khỏi map
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            // Tạo query string từ các params còn lại
            String queryString = params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> {
                        try {
                            return e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8.toString());
                        } catch (UnsupportedEncodingException ex) {
                            throw new RuntimeException(ex);
                        }
                    })
                    .collect(Collectors.joining("&"));

            // Tính hash
            String calculatedHash = generateSecureHash(queryString);

            System.out.println("📊 Signature verification: provided=" + secureHash + ", calculated=" + calculatedHash);
            return secureHash.equalsIgnoreCase(calculatedHash);
        } catch (Exception e) {
            System.err.println("❌ Error verifying signature: " + e.getMessage());
            return false;
        }
    }

    /**
     * Sinh HMAC SHA512
     */
    private String generateSecureHash(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        SecretKeySpec keySpec = new SecretKeySpec(hashSecret.getBytes(StandardCharsets.UTF_8), 0, hashSecret.length(),
                "HmacSHA512");
        mac.init(keySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        // Convert byte array to hex string
        StringBuilder sb = new StringBuilder();
        for (byte b : rawHmac) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
