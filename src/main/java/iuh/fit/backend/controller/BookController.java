package iuh.fit.backend.controller;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookController {
    private final BookService service;

    @GetMapping
    public List<Book> list() {
        return service.findAll();
    }

    @GetMapping("/search")
    public List<Book> search(@RequestParam String q) {
        return service.searchByTitle(q);
    }

    @GetMapping("/{id}")
    public Book get(@PathVariable String id) {
        return service.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
    }

    @PostMapping
    public Book create(@RequestBody Book book) {
        return service.save(book);
    }

    @PutMapping("/{id}")
    public Book update(@PathVariable String id, @RequestBody Book book) {
        book.setBookId(id);
        return service.save(book);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 nếu không tồn tại
        }
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204 nếu xoá thành công
    }

}
