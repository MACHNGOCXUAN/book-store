package iuh.fit.backend.controller;

import iuh.fit.backend.model.Banner;
import iuh.fit.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;


    @GetMapping
    public ResponseEntity<List<Banner>> getFilterBanners(
            @RequestParam(name = "title", required = false) String title,
            @RequestParam(name = "isVisible", required = false) Boolean isVisible,
            @RequestParam(name = "url", required = false) String url) {

        List<Banner> banners = bannerService.filterBanners(title, isVisible, url);
        return ResponseEntity.ok(banners);
    }


    @GetMapping("/visible")
    public ResponseEntity<List<Banner>> getVisibleBanners() {
        List<Banner> banners = bannerService.findAllVisibleAndSorted();
        return ResponseEntity.ok(banners);
    }


    @PostMapping
    public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
        // ID của banner được tạo tự động bằng UUID, không cần gán thủ công
        Banner savedBanner = bannerService.save(banner);
        return ResponseEntity.created(URI.create("/api/banners/" + savedBanner.getBannerId()))
                .body(savedBanner);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable String id) {
        Banner banner = bannerService.findById(id);
        if (banner != null) {
            return ResponseEntity.ok(banner);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable String id, @RequestBody Banner banner) {
        // Kiểm tra xem banner có tồn tại không
        if (bannerService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        // Đảm bảo ID trong URL được gán vào đối tượng trước khi lưu
        banner.setBannerId(id);
        Banner updatedBanner = bannerService.save(banner);
        return ResponseEntity.ok(updatedBanner);
    }
}
