package iuh.fit.backend.service;

import java.util.List;
import java.util.Optional;

import iuh.fit.backend.dto.requests.BookCreateDTO;
import org.springframework.data.domain.Page;

import iuh.fit.backend.dto.requests.ProductFilterDto;
import iuh.fit.backend.model.Book;

public interface BookService {
    Book save(BookCreateDTO bookCreateDTO);

    boolean delete(String id);

    Optional<Book> findById(String id);

    List<Book> findAll();

    List<Book> searchByTitle(String keyword);

    List<Book> saveAll(List<Book> books);

    Page<Book> getProductFilter(ProductFilterDto productFilterDto);

    List<Book> getTop20BestsellerBooks();

    List<Book> getTop20BestsellerBooksByWeek();

    List<Book> getTop20BestsellerBooksByMonth();

    List<Book> getTop20BestsellerBooksByYear();

    List<Book> findByCategoryId(String categoryId);

    public List<Book> searchBook(String search);
}
