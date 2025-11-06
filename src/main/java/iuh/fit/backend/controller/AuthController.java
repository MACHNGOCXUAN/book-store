package iuh.fit.backend.controller;

import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.User;
import iuh.fit.backend.dto.requests.JwtAuthRequest;
import iuh.fit.backend.dto.requests.RegisterDto;
import iuh.fit.backend.dto.responses.JwtAuthResponse;
import iuh.fit.backend.security.CustomUserDetail;
import iuh.fit.backend.service.CustomerService;
import iuh.fit.backend.service.PasswordResetService;
import iuh.fit.backend.service.UserService;
import iuh.fit.backend.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final CustomerService customerService;
    private final UserService userService; // Dùng để tra user theo email (Google)
    private final PasswordResetService passwordResetService;

    // ======================= ADMIN LOGIN =======================
    @PostMapping("/admin/login")
    public ResponseEntity<?> login(@RequestBody JwtAuthRequest body) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(body.getUsername(), body.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            CustomUserDetail userDetails = (CustomUserDetail) authentication.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);

            JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();
            jwtAuthResponse.setAccess_token(token);
            return ResponseEntity.ok(jwtAuthResponse);
        } catch (Exception e) {
            log.warn("Admin login failed for username={}", body.getUsername(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Không đúng mật khẩu hoặc user.");
        }
    }

    // ======================= REGISTER (KHÁCH) =======================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto body) {
        try {
            // KHÔNG tự set userId ở controller — service sẽ phát sinh USER###
            Customer customer = new Customer();
            customer.setFullName(body.getFullName());
            customer.setEmail(body.getEmail());
            customer.setPhoneNumber(body.getPhone());
            customer.setStatus(true);
            customer.setRegistrationDate(LocalDate.now());
            customer.setPassword(body.getPassword()); // service sẽ encode
            // optional fields
            try {
                if (body.getDateOfBirth() != null && !body.getDateOfBirth().isBlank()) {
                    customer.setDateOfBirth(LocalDate.parse(body.getDateOfBirth()));
                }
            } catch (Exception ignored) {
            }

            Customer saved = customerService.saveCustomer(customer);
            if (saved == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Đăng ký thất bại");
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Register error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi đăng ký");
        }
    }

    // ======================= GOOGLE LOGIN =======================
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body("Missing idToken");
        }

        try {
            RestTemplate rt = new RestTemplate();
            String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            Map<?, ?> resp = rt.getForObject(verifyUrl, Map.class);

            if (resp == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            String email = (String) resp.get("email");
            String name = (String) resp.get("name");
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token: missing email");
            }

            // Tìm user theo email
            Optional<User> optUser = userService.findUserByEmail(email);
            User user;

            if (optUser.isPresent()) {
                // User đã tồn tại -> chỉ cần lấy ra
                user = optUser.get();
                log.info("Google login: User exists with email={}", email);
            } else {
                // User chưa tồn tại -> tạo mới Customer
                log.info("Google login: Creating new user with email={}", email);
                Customer c = new Customer();
                c.setFullName(name != null && !name.isBlank() ? name : email);
                c.setEmail(email);
                c.setPhoneNumber(""); // Để trống số điện thoại cho OAuth users
                c.setStatus(true);
                c.setRegistrationDate(LocalDate.now());
                // Không đặt password cho OAuth users (hoặc set thành null/random)
                c.setPassword(""); // Backend sẽ xử lý encoding

                user = customerService.saveCustomer(c);
            }

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Không thể tạo tài khoản Google");
            }

            CustomUserDetail cud = new CustomUserDetail(user);
            String token = jwtUtils.generateToken(cud);

            // Tạo response object với token và user info
            Map<String, Object> jwtAuthResponse = new java.util.HashMap<>();
            jwtAuthResponse.put("access_token", token);

            Map<String, Object> userInfo = new java.util.HashMap<>();
            userInfo.put("userId", user.getUserId());
            userInfo.put("email", user.getEmail());
            userInfo.put("phoneNumber", user.getPhoneNumber());

            // fullName chỉ có trong Customer
            if (user instanceof Customer) {
                userInfo.put("fullName", ((Customer) user).getFullName());
            }

            jwtAuthResponse.put("user", userInfo);

            return ResponseEntity.ok(jwtAuthResponse);
        } catch (Exception e) {
            log.error("Google login failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Google login failed: " + e.getMessage());
        }
    }

    @PostMapping("/admin/login-admin")
    public ResponseEntity<?> loginAdmin(@RequestBody JwtAuthRequest body) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(body.getUsername(), body.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            CustomUserDetail userDetails = (CustomUserDetail) authentication.getPrincipal();
            String userRole = userDetails.getRole();
            System.out.println("xuan: " + userRole);
            List<String> allowedRoles = Arrays.asList("ADMIN", "STAFF");

            if (!allowedRoles.contains(userRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Bạn không có quyền truy cập!");
            }

            String token = jwtUtils.generateToken(userDetails);

            JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();
            jwtAuthResponse.setAccess_token(token);
            return ResponseEntity.ok(jwtAuthResponse);
        } catch (Exception e) {
            log.warn("Admin login failed for username={}", body.getUsername(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Không đúng mật khẩu hoặc user.");
        }
    }

    @GetMapping("admin/get-profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }
        String token = authHeader.substring(7);
        String userId = jwtUtils.getUserIdFromToken(token);
        User user = userService.findUserById(userId);

        if (user.getRole().equals("CUSTOMER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền truy cập!");
        }
        return ResponseEntity.ok(user);
    }

    // ======================= PASSWORD RESET (OTP) =======================
    @PostMapping("/password/otp/request")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống."));
        }


        passwordResetService.requestOtp(email.trim());
        // Luôn trả về OK, không lộ email tồn tại
        return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, mã OTP đã được gửi."));
    }

    @PostMapping("/password/otp/reset")
    public ResponseEntity<?> resetPasswordWithOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp = body.get("otp");
            String newPassword = body.get("newPassword");

            if (email == null || email.isBlank() || otp == null || otp.isBlank() || newPassword == null
                    || newPassword.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng điền đầy đủ thông tin."));
            }

            passwordResetService.resetWithOtp(email.trim(), otp.trim(), newPassword);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
        } catch (IllegalArgumentException e) {
            log.warn("Password reset failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Password reset error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi đặt lại mật khẩu."));
        }
    }
}
