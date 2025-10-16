package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.repository.BookRepository;
import iuh.fit.backend.requests.ProductFilterDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements iuh.fit.backend.service.BookService {
    private final BookRepository repo;

    @Override
    public Book save(Book book) {
        // Nếu muốn phát sinh ID B001, B002 thì viết thêm logic ở đây
        if (book.getBookId() == null || book.getBookId().isBlank()) {
//            String prefix = "B";
//            int nextNum = (int) (repo.count() + 1);
//            book.setBookId(prefix + String.format("%03d", nextNum));
            book.setBookId("B" + System.currentTimeMillis());
        }
        return repo.save(book);
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

}
