package iuh.fit.backend.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import iuh.fit.backend.security.CustomUserDetail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    // Token hết hạn trong 5 giờ
    public static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60;
    private String secret = "afafasfafafasfasfasfafacasdasfasxASFACASDFACASDFASFASFDAFASFASDAADSCSDFADCVSGCFVADXCcadwavfsfarvf";

    @Value("${book.app.jwtSecret}")
    private String jwtSecret;

    @Value("${book.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // Lấy thông tin người dùng từ token
    public String getUsernameFromToken(String token) {
        // Lấy userId từ token, không phải phoneNumber
        // vì phoneNumber có thể thay đổi nhưng userId không
        final Claims claims = getAllClaimsFromToken(token);
        return claims.get("userId", String.class);
    }

    public String getUserIdFromToken(String token) {
        final Claims claims = getAllClaimsFromToken(token);
        return claims.get("userId", String.class); // lay id nguoi dung
    }

    // Lấy thời gian hết hạn token
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    // lấy thông tin claim
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    // lấy tất cả claim
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Kiểm tra token với thời gian hiện tại đã hết hạn chưa
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public String generateToken(CustomUserDetail userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Sử dụng userId thay vì phoneNumber vì userId không bao giờ thay đổi
        claims.put("userId", userDetails.getUserId());
        return doGenerateToken(claims, userDetails.getUserId());
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims) // dữ liệu trong token
                .setSubject(subject) // userId (không phải phoneNumber)
                .setIssuedAt(new Date(System.currentTimeMillis())) // thời gian tạo
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000)) // thời gian hết hạn
                .signWith(SignatureAlgorithm.HS512, secret) // ký token bằng HS512 + secret
                .compact(); // chuyển token thành string
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
