package iuh.fit.backend.service;

import iuh.fit.backend.dto.requests.ArticleRequest;
import iuh.fit.backend.dto.responses.ArticleResponse;

import java.util.List;

public interface ArticleService {
    ArticleResponse create(ArticleRequest req);
    ArticleResponse update(String id, ArticleRequest req);
    void delete(String id);
    ArticleResponse getById(String id);
    List<ArticleResponse> getAll();
    List<ArticleResponse> search(String title, Boolean isVisible);
}
