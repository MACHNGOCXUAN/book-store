package iuh.fit.backend.service;

import iuh.fit.backend.model.PasswordResetOTP;
import iuh.fit.backend.model.User;
import iuh.fit.backend.repository.PasswordResetOTPRepository;
import iuh.fit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final PasswordResetOTPRepository otpRepo;
    private final UserRepository userRepo;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private static final int OTP_TTL_MINUTES = 15;

    /**
     * Sinh OTP 6 số ngẫu nhiên
     */
    private String generateOtp6() {
        int code = ThreadLocalRandom.current().nextInt(100000, 1000000);
        return String.valueOf(code);
    }

    /**
     * Yêu cầu OTP: gửi email nếu user tồn tại
     * Luôn trả về 200 (không lộ email tồn tại)
     */
    @Transactional
    public void requestOtp(String email) {
        var user = userRepo.findByEmail(email).orElse(null);
        // Trả về 200 ngay cả khi không có user (tránh lộ email)
        if (user == null) {
            log.info("OTP request for non-existent email: {}", email);
            return;
        }

        log.info("OTP request for user: {}", user.getUserId());

        // Optional: revoke OTP cũ còn hiệu lực
        var actives = otpRepo.findActiveByUserId(user.getUserId(), LocalDateTime.now());
        actives.forEach(o -> o.setUsed(true));
        otpRepo.saveAll(actives);

        String otp = generateOtp6();
        String hash = passwordEncoder.encode(otp);

        var entity = new PasswordResetOTP();
        entity.setUserId(user.getUserId());
        entity.setOtpHash(hash);
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES));
        otpRepo.save(entity);

        // Gửi email
        sendOtpEmail(user.getEmail(), otp, OTP_TTL_MINUTES);
        log.info("OTP sent to user email: {}", user.getEmail());
    }

    /**
     * Gửi email OTP
     */
    private void sendOtpEmail(String to, String otp, int ttlMinutes) {
        try {
            var msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("Mã đặt lại mật khẩu");
            msg.setText("Xin chào,\n\n"
                    + "Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản tại BookStore.\n\n"
                    + "Mã OTP của bạn là: " + otp + "\n"
                    + "Mã có hiệu lực trong " + ttlMinutes + " phút.\n\n"
                    + "Nếu không phải bạn yêu cầu, hãy bỏ qua email này.\n\n"
                    + "Trân trọng,\n"
                    + "BookStore Team");
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
        }
    }

    /**
     * Đặt lại mật khẩu với OTP
     */
    @Transactional
    public void resetWithOtp(String email, String otp, String newPassword) {
        // Validate password
        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 8) {
            throw new IllegalArgumentException("Mật khẩu phải tối thiểu 8 ký tự.");
        }
        if (!newPassword.matches("^(?=.*[A-Za-z])(?=.*\\d).{8,}$")) {
            throw new IllegalArgumentException("Mật khẩu phải có chữ và số.");
        }

        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại."));

        var actives = otpRepo.findActiveByUserId(user.getUserId(), LocalDateTime.now());
        if (actives.isEmpty()) {
            throw new IllegalArgumentException("OTP không hợp lệ hoặc đã hết hạn.");
        }

        // Lấy mã mới nhất
        var latest = actives.get(0);

        // Chặn brute-force
        if (latest.getAttempts() >= latest.getMaxAttempts()) {
            latest.setUsed(true);
            otpRepo.save(latest);
            log.warn("Too many failed attempts for user: {}", user.getUserId());
            throw new IllegalArgumentException("Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu mã mới.");
        }

        latest.setAttempts(latest.getAttempts() + 1);

        if (!passwordEncoder.matches(otp, latest.getOtpHash())) {
            otpRepo.save(latest);
            log.warn("Invalid OTP attempt for user: {}", user.getUserId());
            throw new IllegalArgumentException("OTP không đúng.");
        }

        // Hợp lệ
        latest.setUsed(true);
        otpRepo.save(latest);

        // Đặt mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        log.info("Password reset successful for user: {}", user.getUserId());
        // (Khuyến nghị) Revoke refresh tokens, logout sessions…
    }
}
