package iuh.fit.backend.security;

import iuh.fit.backend.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

public class CustomUserDetail implements UserDetails {

    private String id;
    private String username;
    private String password;
    @Getter
    private String role;
    private List<GrantedAuthority> authorities;

    public CustomUserDetail(String id, String username, String password, String role,
            List<GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.authorities = authorities;
    }

    public CustomUserDetail(User user) {
        this.id = user.getUserId();
        // Lưu ý: username ở đây là userId, không phải phoneNumber
        // vì chúng ta sử dụng userId trong JWT token
        this.username = user.getUserId();
        this.password = user.getPassword();
        this.role = String.valueOf(user.getRole());
        this.authorities = List.of(new SimpleGrantedAuthority(user.getRole().name().toLowerCase()));
    }

    public String getUserId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}
