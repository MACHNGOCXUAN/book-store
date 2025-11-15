package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Banner;
import iuh.fit.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements iuh.fit.backend.service.BannerService {
    private final BannerRepository bannerRepository;

    @Override
    public List<Banner> findAll() {
        return bannerRepository.findAll();
    }

    @Override
    public List<Banner> filterBanners(String title, Boolean isVisible, String url) {
        // Kiểm tra xem tham số nào được cung cấp
        boolean hasTitle = (title != null && !title.isEmpty());
        // Đối với Boolean, chỉ cần kiểm tra khác null
        boolean hasVisibility = (isVisible != null);
        boolean hasUrl = (url != null && !url.isEmpty());

        // Logic lọc tương tự như file mẫu của bạn
        if (hasTitle && hasVisibility && hasUrl) {
            return bannerRepository.findByTitleContainingAndIsVisibleAndUrlContaining(title, isVisible, url);
        } else if (hasTitle && hasVisibility) {
            return bannerRepository.findByTitleContainingAndIsVisible(title, isVisible);
        } else if (hasTitle && hasUrl) {
            return bannerRepository.findByTitleContainingAndUrlContaining(title, url);
        } else if (hasVisibility && hasUrl) {
            return bannerRepository.findByIsVisibleAndUrlContaining(isVisible, url);
        } else if (hasTitle) {
            return bannerRepository.findByTitleContaining(title);
        } else if (hasVisibility) {
            return bannerRepository.findByIsVisible(isVisible);
        } else if (hasUrl) {
            return bannerRepository.findByUrlContaining(url);
        }

        // Nếu không có bộ lọc nào, trả về tất cả
        return bannerRepository.findAll();
    }

    @Override
    public Banner save(Banner banner) {
        // Ghi chú: Logic lưu (save) của Banner đơn giản hơn DiscountCode
        // Lý do: Banner entity của bạn sử dụng @GeneratedValue(strategy = GenerationType.UUID)
        // Điều này có nghĩa là ID sẽ được tự động tạo (là một UUID) khi tạo mới.
        // Bạn không cần viết logic tạo ID thủ công như ("DC" + "001")

        // Các trường @CreatedDate, @LastModifiedDate, @CreatedBy
        // thường sẽ được tự động quản lý bởi Spring Data JPA Auditing.

        return bannerRepository.save(banner);
    }

    @Override
    public Banner findById(String id) {
        return bannerRepository.findById(id).orElse(null);
    }

    @Override
    public List<Banner> findAllVisibleAndSorted() {
        // Gọi phương thức trong repository đã tạo ở bước trước
        // Đây là phương thức rất hữu ích để hiển thị banner ra trang chủ
        return bannerRepository.findByIsVisibleOrderByDisplayOrderAsc(true);
    }
}
