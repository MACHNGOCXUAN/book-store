package iuh.fit.backend.service;

public interface PasswordResetService {
    default void requestOtp(String email) {}
    default void resetWithOtp(String email, String otp, String newPassword) {}
}
