package iuh.fit.backend.service;

import iuh.fit.backend.model.Book;

import java.util.List;
import java.util.Optional;

public interface BookService {
    Book save(Book book);

    void delete(String id);

    Optional<Book> findById(String id);

    List<Book> findAll();

    List<Book> searchByTitle(String keyword);

    List<Book> saveAll(List<Book> books);
}
