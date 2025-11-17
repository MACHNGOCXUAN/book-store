package iuh.fit.backend.service;

import iuh.fit.backend.model.Banner;

import java.util.List;

public interface BannerService {
    List<Banner> findAll();

    List<Banner> filterBanners(String title, Boolean isVisible, String url);

    Banner save(Banner banner);

    Banner findById(String id);

    List<Banner> findAllVisibleAndSorted();
}
