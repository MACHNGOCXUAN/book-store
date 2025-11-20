package iuh.fit.backend.payment.momo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MoMoService {

    @Value("${payment.momo.partner-code}")
    private String partnerCode;

    @Value("${payment.momo.access-key}")
    private String accessKey;

    @Value("${payment.momo.secret-key}")
    private String secretKey;

    @Value("${payment.momo.endpoint}")
    private String endpoint;

    @Value("${payment.momo.redirect-url}")
    private String redirectUrl;

    @Value("${payment.momo.ipn-url}")
    private String ipnUrl;

    @Value("${payment.momo.request-type}")
    private String requestType;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Tạo payment request đến MoMo và trả về payUrl + QR code
     */
    public MoMoPaymentResponse createPayment(String orderId, long amount, String orderInfo) {
        try {
            String requestId = orderId + System.currentTimeMillis();
            String extraData = ""; // Optional

            // Build raw signature
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            log.info("🔐 MoMo Raw Signature: {}", rawSignature);

            // Generate signature using HMAC SHA256
            String signature = hmacSHA256(rawSignature, secretKey);
            log.info("🔑 MoMo Signature: {}", signature);

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", "Bookstore");
            requestBody.put("storeId", "BookstoreOnline");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", redirectUrl);
            requestBody.put("ipnUrl", ipnUrl);
            requestBody.put("lang", "vi");
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", requestType);
            requestBody.put("signature", signature);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            log.info("📤 MoMo Request Body: {}", jsonBody);

            // Send POST request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("📥 MoMo Response: {}", response.body());

            // Parse response
            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);

            Integer resultCode = (Integer) responseMap.get("resultCode");
            if (resultCode != null && resultCode == 0) {
                String payUrl = (String) responseMap.get("payUrl");
                String qrCodeUrl = (String) responseMap.get("qrCodeUrl");
                String deeplink = (String) responseMap.get("deeplink");

                log.info("✅ MoMo Payment Created: payUrl={}, qrCodeUrl={}", payUrl, qrCodeUrl);

                return MoMoPaymentResponse.builder()
                        .success(true)
                        .payUrl(payUrl)
                        .qrCodeUrl(qrCodeUrl)
                        .deeplink(deeplink)
                        .message("Success")
                        .build();
            } else {
                String message = (String) responseMap.get("message");
                log.error("❌ MoMo Error: resultCode={}, message={}", resultCode, message);

                return MoMoPaymentResponse.builder()
                        .success(false)
                        .message(message != null ? message : "MoMo payment failed")
                        .build();
            }

        } catch (Exception e) {
            log.error("❌ MoMo Exception: ", e);
            return MoMoPaymentResponse.builder()
                    .success(false)
                    .message("Exception: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Verify MoMo IPN callback signature
     */
    public boolean verifySignature(Map<String, String> params) {
        try {
            String receivedSignature = params.get("signature");
            
            // Build raw signature từ params
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + params.get("amount") +
                    "&extraData=" + params.getOrDefault("extraData", "") +
                    "&message=" + params.get("message") +
                    "&orderId=" + params.get("orderId") +
                    "&orderInfo=" + params.get("orderInfo") +
                    "&orderType=" + params.get("orderType") +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + params.get("payType") +
                    "&requestId=" + params.get("requestId") +
                    "&responseTime=" + params.get("responseTime") +
                    "&resultCode=" + params.get("resultCode") +
                    "&transId=" + params.get("transId");

            String calculatedSignature = hmacSHA256(rawSignature, secretKey);
            
            log.info("🔍 Verify MoMo Signature:");
            log.info("   Received: {}", receivedSignature);
            log.info("   Calculated: {}", calculatedSignature);
            
            return calculatedSignature.equals(receivedSignature);
            
        } catch (Exception e) {
            log.error("❌ Error verifying MoMo signature: ", e);
            return false;
        }
    }

    /**
     * HMAC SHA256 helper
     */
    private String hmacSHA256(String data, String key) throws Exception {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKeySpec);
        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex string
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
