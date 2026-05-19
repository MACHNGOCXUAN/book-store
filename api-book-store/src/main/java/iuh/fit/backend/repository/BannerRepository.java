package iuh.fit.backend.repository;

import iuh.fit.backend.model.Banner;
import iuh.fit.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, String> {
    List<Banner> findByBannerId(String bannerId);

    List<Banner> findByTitleContaining(String title);

    List<Banner> findByIsVisible(boolean isVisible);

    List<Banner> findByUrlContaining(String url);

    List<Banner> findByTitleContainingAndIsVisible(String title, boolean isVisible);

    List<Banner> findByIsVisibleAndUrlContaining(boolean isVisible, String url);

    List<Banner> findByTitleContainingAndUrlContaining(String title, String url);

    List<Banner> findByTitleContainingAndIsVisibleAndUrlContaining(String title, boolean isVisible, String url);

    /**
     * Tìm tất cả các banner đang hiển thị và sắp xếp theo thứ tự ưu tiên (displayOrder)
     * Đây là phương thức truy vấn rất phổ biến cho banner.
     */
    List<Banner> findByIsVisibleOrderByDisplayOrderAsc(boolean isVisible);

}
