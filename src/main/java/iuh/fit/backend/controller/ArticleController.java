package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.ArticleRequest;
import iuh.fit.backend.dto.responses.ArticleResponse;
import iuh.fit.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    // Tạo bài viết
    @PostMapping
    public ArticleResponse create(@RequestBody ArticleRequest req) {
        return articleService.create(req);
    }

    // Cập nhật bài viết
    @PutMapping("/{id}")
    public ArticleResponse update(@PathVariable String id, @RequestBody ArticleRequest req) {
        return articleService.update(id, req);
    }

    // Xóa bài viết
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        articleService.delete(id);
    }

    // Lấy bài viết theo ID
    @GetMapping("/{id}")
    public ArticleResponse getById(@PathVariable String id) {
        return articleService.getById(id);
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean isVisible
    ) {
        return ResponseEntity.ok(articleService.search(title, isVisible));
    }

}
