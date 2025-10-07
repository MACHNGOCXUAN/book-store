package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
            String prefix = "B";
            int nextNum = (int) (repo.count() + 1);
            book.setBookId(prefix + String.format("%03d", nextNum));
        }
        return repo.save(book);
    }

    @Override
    public void delete(String id) {
        repo.deleteById(id);
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
}
