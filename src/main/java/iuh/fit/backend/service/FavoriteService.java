package iuh.fit.backend.service;

import iuh.fit.backend.model.Book;

import java.util.Set;

public interface FavoriteService {
    String addFavorite(String customerId, String bookId);

    String removeFavorite(String customerId, String bookId);

    Set<Book> getFavorites(String customerId);
}
