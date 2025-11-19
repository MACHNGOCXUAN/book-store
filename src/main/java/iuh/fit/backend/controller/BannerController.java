package iuh.fit.backend.controller;

import iuh.fit.backend.model.Banner;
import iuh.fit.backend.service.BannerService;
import iuh.fit.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;
    private final CloudinaryService cloudinaryService;


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


    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Banner> createBanner(
            @RequestParam("title") String title,
            @RequestParam(value = "displayOrder", defaultValue = "0") int displayOrder,
            @RequestParam(value = "isVisible", defaultValue = "false") boolean isVisible,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setDisplayOrder(displayOrder);
        banner.setVisible(isVisible);
        banner.setUrl(url);

        // Upload ảnh lên Cloudinary nếu có
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            banner.setImageUrl(imageUrl);
        }

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

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Banner> updateBanner(
            @PathVariable String id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "isVisible", required = false) Boolean isVisible,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        // Kiểm tra xem banner có tồn tại không
        Banner existingBanner = bannerService.findById(id);
        if (existingBanner == null) {
            return ResponseEntity.notFound().build();
        }

        // Cập nhật các trường nếu có
        if (title != null) existingBanner.setTitle(title);
        if (displayOrder != null) existingBanner.setDisplayOrder(displayOrder);
        if (isVisible != null) existingBanner.setVisible(isVisible);
        if (url != null) existingBanner.setUrl(url);

        // Upload ảnh mới lên Cloudinary nếu có
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            existingBanner.setImageUrl(imageUrl);
        }

        Banner updatedBanner = bannerService.save(existingBanner);
        return ResponseEntity.ok(updatedBanner);
    }
}
