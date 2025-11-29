package iuh.fit.backend.service.impl;

import iuh.fit.backend.dto.requests.ArticleRequest;
import iuh.fit.backend.dto.responses.ArticleResponse;
import iuh.fit.backend.model.Article;
import iuh.fit.backend.model.User;
import iuh.fit.backend.repository.ArticleRepository;
import iuh.fit.backend.repository.UserRepository;
import iuh.fit.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepo;
    private final UserRepository userRepo;

    // ======================
    // Convert Entity -> DTO
    // ======================
    private ArticleResponse toResponse(Article article) {
        ArticleResponse dto = new ArticleResponse();

        dto.setArticleId(article.getArticleId());
        dto.setTitle(article.getTitle());
        dto.setContent(article.getContent());
        dto.setThumbnailUrl(article.getThumbnailUrl());

        dto.setCreatedBy(
                article.getCreatedBy() != null
                        ? article.getCreatedBy().getFullName()
                        : null
        );

        dto.setUpdatedBy(
                article.getUpdatedBy() != null
                        ? article.getUpdatedBy().getFullName()
                        : null
        );

        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        dto.setIsVisible(article.isVisible());  // ⭐ quan trọng

        return dto;
    }


    // ======================
    // CREATE
    // ======================
    @Override
    public ArticleResponse create(ArticleRequest req) {
        Article article = new Article();

        article.setTitle(req.getTitle());
        article.setContent(req.getContent());
        article.setThumbnailUrl(req.getThumbnailUrl());
        article.setVisible(req.getIsVisible() != null ? req.getIsVisible() : false);

        // createdBy
        User creator = userRepo.findById(req.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));
        article.setCreatedBy(creator);

        // updatedBy = null khi mới tạo

        Article saved = articleRepo.save(article);
        return toResponse(saved);
    }


    // ======================
    // UPDATE
    // ======================
    @Override
    public ArticleResponse update(String id, ArticleRequest req) {

        Article article = articleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        article.setTitle(req.getTitle());
        article.setContent(req.getContent());
        article.setThumbnailUrl(req.getThumbnailUrl());

        // ⭐ UPDATE isVisible
        if (req.getIsVisible() != null) {
            article.setVisible(req.getIsVisible());
        }

        // ⭐ Người sửa
        if (req.getUpdatedById() != null) {
            User updater = userRepo.findById(req.getUpdatedById())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            article.setUpdatedBy(updater);
        }

        Article saved = articleRepo.save(article);
        return toResponse(saved);
    }


    // ======================
    // DELETE
    // ======================
    @Override
    public void delete(String id) {
        articleRepo.deleteById(id);
    }


    // ======================
    // GET BY ID
    // ======================
    @Override
    public ArticleResponse getById(String id) {
        Article article = articleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        return toResponse(article);
    }


    // ======================
    // GET ALL
    // ======================
    @Override
    public List<ArticleResponse> getAll() {
        return articleRepo.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ArticleResponse> search(String title, Boolean isVisible) {
        List<Article> list = articleRepo.search(title, isVisible);
        return list.stream()
                .map(this::toResponse)
                .toList();
    }

}

