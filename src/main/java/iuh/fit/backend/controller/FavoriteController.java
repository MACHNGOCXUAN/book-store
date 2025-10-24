package iuh.fit.backend.controller;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    @PostMapping("/add")
    public ResponseEntity<String> addFavorite(
            @RequestParam String customerId,
            @RequestParam String bookId) {
        System.out.println("thong tin nguoi them va id sach: "+ customerId + bookId);
        return ResponseEntity.ok(favoriteService.addFavorite(customerId, bookId));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeFavorite(
            @RequestParam String customerId,
            @RequestParam String bookId) {
        return ResponseEntity.ok(favoriteService.removeFavorite(customerId, bookId));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<Set<Book>> getFavorites(@PathVariable String customerId) {
        return ResponseEntity.ok(favoriteService.getFavorites(customerId));
    }
}
