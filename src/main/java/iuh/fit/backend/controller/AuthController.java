package iuh.fit.backend.controller;

import iuh.fit.backend.requests.JwtAuthRequest;
import iuh.fit.backend.requests.RegisterDto;
import iuh.fit.backend.responses.JwtAuthResponse;
import iuh.fit.backend.security.CustomUserDetail;
import iuh.fit.backend.utils.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final iuh.fit.backend.service.CustomerService customerService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, iuh.fit.backend.service.CustomerService customerService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.customerService = customerService;
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> login(@RequestBody JwtAuthRequest body) {
        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(body.getPhone(), body.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            CustomUserDetail userDetails = (CustomUserDetail) authentication.getPrincipal();

            String token = this.jwtUtils.generateToken(userDetails);
            JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();
            jwtAuthResponse.setAccess_token(token);
            return new ResponseEntity<JwtAuthResponse>(jwtAuthResponse, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Không đúng mật khẩu hoặc user.", HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto body) {
        try {
            iuh.fit.backend.model.Customer customer = new iuh.fit.backend.model.Customer();
            customer.setUserId("USER" + System.currentTimeMillis());
            customer.setUserName(body.getFullName());
            customer.setFullName(body.getFullName());
            customer.setEmail(body.getEmail());
            customer.setPhoneNumber(body.getPhone());
            customer.setStatus(true);
            customer.setRegistrationDate(java.time.LocalDate.now());
            // set raw password so service can encode it
            customer.setPassword(body.getPassword());

            iuh.fit.backend.model.Customer saved = customerService.saveCustomer(customer);
            if (saved != null) {
                return new ResponseEntity<>(saved, HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Đăng ký thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Lỗi khi đăng ký", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing idToken");
        }

        try {
            RestTemplate rt = new RestTemplate();
            String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            Map resp = rt.getForObject(verifyUrl, Map.class);
            // resp contains email, name, sub (google id), etc.
            String email = (String) resp.get("email");
            String name = (String) resp.get("name");

            if (email == null) return ResponseEntity.status(401).body("Invalid token");

            // find existing user by email
            java.util.Optional<iuh.fit.backend.model.User> existing = this.customerService instanceof iuh.fit.backend.service.CustomerService ? java.util.Optional.empty() : java.util.Optional.empty();
            // use UserService via customerService? try to find by email via repository using customerService save/find methods
            iuh.fit.backend.service.UserService userService = null;
            try {
                userService = (iuh.fit.backend.service.UserService) org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext().getBean(iuh.fit.backend.service.UserService.class);
            } catch (Exception ex) {
                // fallback: try to query customer repository indirectly
            }

            iuh.fit.backend.model.User user = null;
            if (userService != null) {
                java.util.Optional<iuh.fit.backend.model.User> uopt = userService.findUserByEmail(email);
                if (uopt.isPresent()) user = uopt.get();
            }

            // if not found, create a customer
            if (user == null) {
                iuh.fit.backend.model.Customer customer = new iuh.fit.backend.model.Customer();
                customer.setUserId("USER" + System.currentTimeMillis());
                customer.setUserName(name != null ? name : email);
                customer.setFullName(name != null ? name : email);
                customer.setEmail(email);
                customer.setPhoneNumber("");
                customer.setStatus(true);
                customer.setRegistrationDate(java.time.LocalDate.now());
                // let service save (it will encode password if present)
                iuh.fit.backend.model.Customer saved = customerService.saveCustomer(customer);
                user = saved;
            }

            // build JWT
            iuh.fit.backend.security.CustomUserDetail cud = new iuh.fit.backend.security.CustomUserDetail(user);
            String token = this.jwtUtils.generateToken(cud);
            iuh.fit.backend.responses.JwtAuthResponse jwtAuthResponse = new iuh.fit.backend.responses.JwtAuthResponse();
            jwtAuthResponse.setAccess_token(token);
            return new ResponseEntity< iuh.fit.backend.responses.JwtAuthResponse>(jwtAuthResponse, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Google login failed", HttpStatus.UNAUTHORIZED);
        }
    }

//    @GetMapping("/admin/get-profile")
//    public ResponseEntity<?> getProfile(@RequestHeader (name="Authorization") String token) {
//        try {
//            System.out.println("je;;: " + token);
//        } catch (Exception e) {
//            return new ResponseEntity<>("Không tìm thấy ", HttpStatus.UNAUTHORIZED);
//        }
//    }
}
