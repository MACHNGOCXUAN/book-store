package iuh.fit.backend.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import iuh.fit.backend.dto.requests.BookCreateDTO;
import iuh.fit.backend.model.Category;
import iuh.fit.backend.repository.CategoryRepository;
import iuh.fit.backend.service.BookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import iuh.fit.backend.dto.requests.ProductFilterDto;
import iuh.fit.backend.model.Book;
import iuh.fit.backend.repository.BookRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {
    private final BookRepository repo;
    private final CategoryRepository categoryRepository;

    @Override
    public Book save(BookCreateDTO book) {
        if (book.getBookId() == null || book.getBookId().isBlank()) {
            String prefix = "B";
            String lastId = repo.findIdMaxBookId();
            int nextNum = 1;
            if (lastId != null && lastId.startsWith("B")) {
                try {
                    nextNum = Integer.parseInt(lastId.substring(1)) + 1;
                } catch (NumberFormatException e) {
                    nextNum = 1;
                }
            }
            book.setBookId(prefix + String.format("%03d", nextNum));
        }
        Book newBook = new Book();
        newBook.setBookId(book.getBookId());
        newBook.setTitle(book.getTitle());
        newBook.setAuthor(book.getAuthor());
        newBook.setPublisher(book.getPublisher());
        newBook.setPrice(book.getPrice());
        newBook.setImportPrice(book.getImportPrice());
        newBook.setStock(book.getStock());
        newBook.setPublishDate(book.getPublishDate());
        newBook.setDescription(book.getDescription());
        newBook.setCoverImage(book.getCoverImage());
        newBook.setDiscountPercent(book.getDiscountPercent());

        Category category = categoryRepository.findByCategoryId(book.getCategory_id());
        newBook.setCategory(category);

        return repo.save(newBook);
    }

    @Override
    public boolean delete(String id) {
        if (repo.findById(id).isPresent()) {
            repo.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Optional<Book> findById(String id) {
        return repo.findById(id);
    }

    @Override
    public List<Book> findAll() {
        return repo.findAll();
    }

    @Override
    public List<Book> searchByTitle(String keyword) {
        return repo.findByTitleContainingIgnoreCase(keyword);
    }

    @Override
    public List<Book> saveAll(List<Book> books) {
        return repo.saveAll(books);
    }

    @Override
    public Page<Book> getProductFilter(ProductFilterDto productFilterDto) {
        String title = productFilterDto.getTitle() != null ? productFilterDto.getTitle() : "";
        String author = productFilterDto.getAuthor() != null ? productFilterDto.getAuthor() : "";
        Double minPrice = productFilterDto.getMinPrice() != null ? productFilterDto.getMinPrice() : Double.MIN_VALUE;
        Double maxPrice = productFilterDto.getMaxPrice() != null ? productFilterDto.getMaxPrice() : Double.MAX_VALUE;
        int page = productFilterDto.getPage() != null ? productFilterDto.getPage() - 1 : 0;
        int limit = productFilterDto.getLimit() != null ? productFilterDto.getLimit() : 10;

        Specification<Book> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (!title.isEmpty()) {
                predicates.add(cb.like(root.get("title"), "%" + title + "%"));
            }

            if (!author.isEmpty()) {
                predicates.add(cb.like(root.get("author"), "%" + author + "%"));
            }

            predicates.add(cb.between(root.get("price"), minPrice, maxPrice));

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return repo.findAll(spec, PageRequest.of(page, limit, Sort.by("title").ascending()));
    }

    @Override
    public List<Book> getTop20BestsellerBooks() {
        PageRequest pageRequest = PageRequest.of(0, 20);
        return repo.findTop20BestsellerBooks(pageRequest);
    }

    @Override
    public List<Book> getTop20BestsellerBooksByWeek() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        PageRequest pageRequest = PageRequest.of(0, 20);
        return repo.findTop20BestsellerBooksByWeek(startDate, pageRequest);
    }

    @Override
    public List<Book> getTop20BestsellerBooksByMonth() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        PageRequest pageRequest = PageRequest.of(0, 20);
        return repo.findTop20BestsellerBooksByMonth(startDate, pageRequest);
    }

    @Override
    public List<Book> getTop20BestsellerBooksByYear() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(365);
        PageRequest pageRequest = PageRequest.of(0, 20);
        return repo.findTop20BestsellerBooksByYear(startDate, pageRequest);
    }

    @Override
    public List<Book> findByCategoryId(String categoryId) {
        return repo.findByCategoryCategoryId(categoryId);
    }

    @Override
    public List<Book> searchBook(String search){
        return repo.findByTitleContainingIgnoreCase(search);
    }
}
