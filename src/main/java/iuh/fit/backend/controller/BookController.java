package iuh.fit.backend.controller;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.backend.dto.requests.ProductFilterDto;
import iuh.fit.backend.model.Book;
import iuh.fit.backend.service.BookService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService service;

    @GetMapping
    public ResponseEntity<List<Book>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> search(@RequestParam("q") String q) {
        return ResponseEntity.ok(service.searchByTitle(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> get(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/bestsellers/top20")
    public ResponseEntity<List<Book>> getTop20Bestsellers() {
        return ResponseEntity.ok(service.getTop20BestsellerBooks());
    }


    @GetMapping("/bestsellers/week")
    public ResponseEntity<List<Book>> getTop20BestsellersWeek() {
        return ResponseEntity.ok(service.getTop20BestsellerBooksByWeek());
    }

    @GetMapping("/bestsellers/month")
    public ResponseEntity<List<Book>> getTop20BestsellersMonth() {
        return ResponseEntity.ok(service.getTop20BestsellerBooksByMonth());
    }


    @GetMapping("/bestsellers/year")
    public ResponseEntity<List<Book>> getTop20BestsellersYear() {
        return ResponseEntity.ok(service.getTop20BestsellerBooksByYear());
    }

    // Tạo 1 cuốn
    @PostMapping
    public ResponseEntity<Book> create(@RequestBody Book book) {
        Book saved = service.save(book);
        // Nếu bookId tự sinh, Location trỏ tới resource vừa tạo
        return ResponseEntity
                .created(URI.create("/api/books/" + saved.getBookId()))
                .body(saved);
    }

    // Tạo nhiều cuốn (bulk) — nhận mảng JSON
    @PostMapping("/bulk")
    public ResponseEntity<List<Book>> createBulk(@RequestBody List<Book> books) {
        if (books == null || books.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Book> saved = service.saveAll(books);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable String id, @RequestBody Book book) {
        // Có thể kiểm tra tồn tại trước khi update (tuỳ logic)
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        book.setBookId(id);
        Book saved = service.save(book);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        boolean isDeletedBook = service.delete(id);
        if(isDeletedBook) {
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công!"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa sản phẩm thất bại"));
        }
    }



    // admin
    @PostMapping("/filter")
    public ResponseEntity<?> getFilterProduct(@RequestBody ProductFilterDto productFilterDto) {
        Page<Book> pageBook = service.getProductFilter(productFilterDto);
        List<Book> bookList = pageBook.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("data", bookList);

        Map<String, Object> paging = new HashMap<>();
        paging.put("curPage", pageBook.getNumber() + 1);
        paging.put("limitPage", pageBook.getSize());
        paging.put("totalRows", pageBook.getTotalElements());
        paging.put("totalPage", pageBook.getTotalPages());

        response.put("paging", paging);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        return ResponseEntity.ok(service.getBooksByCategory(category));
    }
}
