package iuh.fit.backend.service;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.requests.ProductFilterDto;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface BookService {
    Book save(Book book);

    boolean delete(String id);

    Optional<Book> findById(String id);

    List<Book> findAll();

    List<Book> searchByTitle(String keyword);

    List<Book> saveAll(List<Book> books);

    Page<Book> getProductFilter(ProductFilterDto productFilterDto);
}
