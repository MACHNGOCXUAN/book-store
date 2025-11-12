package iuh.fit.backend.payment.vnpay;

import net.glxn.qrgen.QRCode;
import net.glxn.qrgen.image.ImageType;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

/**
 * Service để sinh QR code từ VNPay payment URL
 */
@Service
public class VnpayQRCodeService {

    /**
     * Tạo QR code từ payment URL và trả về dưới dạng Base64
     * 
     * @param paymentUrl - URL thanh toán từ VNPay
     * @param size       - Kích thước QR code (width/height)
     * @return Base64 encoded QR code image (PNG)
     */
    public String generateQRCodeBase64(String paymentUrl, int size) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            QRCode.from(paymentUrl)
                    .to(ImageType.PNG)
                    .withSize(size, size)
                    .writeTo(out);

            byte[] qrImageBytes = out.toByteArray();
            String base64QR = Base64.getEncoder().encodeToString(qrImageBytes);

            System.out.println("✅ QR Code generated successfully. Size: " + qrImageBytes.length + " bytes");
            return "data:image/png;base64," + base64QR;
        } catch (Exception e) {
            System.err.println("❌ Error generating QR code: " + e.getMessage());
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Overload method với size mặc định 300x300
     */
    public String generateQRCodeBase64(String paymentUrl) {
        return generateQRCodeBase64(paymentUrl, 300);
    }
}
