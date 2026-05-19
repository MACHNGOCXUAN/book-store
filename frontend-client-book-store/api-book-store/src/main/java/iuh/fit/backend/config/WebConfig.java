package iuh.fit.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cho phép Spring Boot phục vụ file tĩnh trong thư mục /uploads
 * Ví dụ: http://localhost:8080/uploads/books/cleancode.jpg
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // "file:uploads/" = đường dẫn tuyệt đối đến thư mục chứa ảnh trong project
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://DESKTOP-GL3I116:3000", "http://localhost:5173", "http://DESKTOP-GL3I116:*", "http://localhost:3000", "http://DESKTOP-GL3I116:5173", "http://localhost:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
