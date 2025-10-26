package iuh.fit.backend.controller;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    @PostMapping("/add")
    public ResponseEntity<?> addFavorite(
            @RequestParam String customerId,
            @RequestParam String bookId) {
        System.out.println("thong tin nguoi them va id sach: " + customerId + bookId);
        try {
            String message = favoriteService.addFavorite(customerId, bookId);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFavorite(
            @RequestParam String customerId,
            @RequestParam String bookId) {
        try {
            String message = favoriteService.removeFavorite(customerId, bookId);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<?> getFavorites(@PathVariable String customerId) {
        try {
            Set<Book> favorites = favoriteService.getFavorites(customerId);
            return ResponseEntity.ok(favorites);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
