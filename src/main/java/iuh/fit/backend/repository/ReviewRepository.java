package iuh.fit.backend.repository;

import iuh.fit.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {
    @Query("SELECT MAX(r.reviewId) from Review r")
    String findMaxReviewId();

    @Query("SELECT r FROM Review r WHERE r.book.bookId = :bookId ORDER BY r.ratingDate DESC")
    List<Review> findByBookId(@Param("bookId") String bookId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.bookId = :bookId")
    Double findAverageRatingByBookId(@Param("bookId") String bookId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.book.bookId = :bookId")
    Integer findTotalReviewsByBookId(@Param("bookId") String bookId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.book.bookId = :bookId AND r.rating = :rating")
    Integer findCountByBookIdAndRating(@Param("bookId") String bookId, @Param("rating") int rating);

    @Query("SELECT r FROM Review r WHERE r.customer.id = :customerId ORDER BY r.ratingDate DESC")
    List<Review> findByCustomerId(@Param("customerId") String customerId);
}
