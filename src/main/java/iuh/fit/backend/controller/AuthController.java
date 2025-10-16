package iuh.fit.backend.controller;

import iuh.fit.backend.requests.JwtAuthRequest;
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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
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

//    @GetMapping("/admin/get-profile")
//    public ResponseEntity<?> getProfile(@RequestHeader (name="Authorization") String token) {
//        try {
//            System.out.println("je;;: " + token);
//        } catch (Exception e) {
//            return new ResponseEntity<>("Không tìm thấy ", HttpStatus.UNAUTHORIZED);
//        }
//    }
}
