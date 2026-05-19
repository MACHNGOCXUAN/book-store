package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Book;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.repository.BookRepository;
import iuh.fit.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements iuh.fit.backend.service.FavoriteService {
    private final CustomerRepository customerRepository;
    private final BookRepository bookRepository;

    @Override
    public String addFavorite(String customerId, String bookId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (customer.getFavoriteBooks().contains(book)) {
            return "Book already in favorites";
        }

        customer.getFavoriteBooks().add(book);
        customerRepository.save(customer);
        return "Book added to favorites";
    }

    @Override
    public String removeFavorite(String customerId, String bookId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        customer.getFavoriteBooks().remove(book);
        customerRepository.save(customer);
        return "Book removed from favorites";
    }

    @Override
    public Set<Book> getFavorites(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return customer.getFavoriteBooks();
    }
}
