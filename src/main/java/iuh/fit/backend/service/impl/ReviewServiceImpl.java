package iuh.fit.backend.service.impl;

import iuh.fit.backend.dto.requests.CreateReviewRequest;
import iuh.fit.backend.dto.requests.UpdateReviewRequest;
import iuh.fit.backend.dto.responses.ReviewDto;
import iuh.fit.backend.dto.responses.ReviewStatisticsDto;
import iuh.fit.backend.model.Book;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.model.Review;
import iuh.fit.backend.repository.BookRepository;
import iuh.fit.backend.repository.CustomerRepository;
import iuh.fit.backend.repository.ReviewRepository;
import iuh.fit.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {
    private static final Logger logger = LoggerFactory.getLogger(ReviewServiceImpl.class);
    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final CustomerRepository customerRepository;

    @Override
    public List<ReviewDto> getReviewsByBookId(String bookId) {
        return reviewRepository.findByBookId(bookId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewDto getReviewById(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        return convertToDto(review);
    }

    @Override
    public ReviewDto createReview(CreateReviewRequest request) {
        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Validate content
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }

        if (request.getContent().trim().length() < 10) {
            throw new IllegalArgumentException("Content must be at least 10 characters");
        }

        // Get book and customer
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + request.getBookId()));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));

        // Create review
        Review review = new Review();
        review.setReviewId(generateReviewId());
        review.setBook(book);
        review.setCustomer(customer);
        review.setRating(request.getRating());
        review.setContent(request.getContent().trim());
        review.setRatingDate(LocalDate.now());

        Review savedReview = reviewRepository.save(review);
        return convertToDto(savedReview);
    }

    @Override
    public ReviewDto updateReview(String reviewId, UpdateReviewRequest request) {
        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Validate content
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }

        if (request.getContent().trim().length() < 10) {
            throw new IllegalArgumentException("Content must be at least 10 characters");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));

        review.setRating(request.getRating());
        review.setContent(request.getContent().trim());

        Review updatedReview = reviewRepository.save(review);
        return convertToDto(updatedReview);
    }

    @Override
    public void deleteReview(String reviewId) {
        logger.info("Attempting to delete review with ID: {}", reviewId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> {
                    logger.error("Review not found with id: {}", reviewId);
                    return new RuntimeException("Review not found with id: " + reviewId);
                });
        logger.info("Found review: {} for customer: {}", reviewId, review.getCustomer().getUserId());
        reviewRepository.delete(review);
        logger.info("Successfully deleted review with ID: {}", reviewId);
    }

    @Override
    public ReviewStatisticsDto getReviewStatistics(String bookId) {
        // Check if book exists
        bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        Double averageRating = reviewRepository.findAverageRatingByBookId(bookId);
        Integer totalReviews = reviewRepository.findTotalReviewsByBookId(bookId);

        if (averageRating == null) {
            averageRating = 0.0;
        }
        if (totalReviews == null) {
            totalReviews = 0;
        }

        ReviewStatisticsDto stats = new ReviewStatisticsDto();
        stats.setAverageRating(Math.round(averageRating * 10.0) / 10.0); // Round to 1 decimal
        stats.setTotalReviews(totalReviews);
        stats.setFiveStarCount(reviewRepository.findCountByBookIdAndRating(bookId, 5));
        stats.setFourStarCount(reviewRepository.findCountByBookIdAndRating(bookId, 4));
        stats.setThreeStarCount(reviewRepository.findCountByBookIdAndRating(bookId, 3));
        stats.setTwoStarCount(reviewRepository.findCountByBookIdAndRating(bookId, 2));
        stats.setOneStarCount(reviewRepository.findCountByBookIdAndRating(bookId, 1));

        return stats;
    }

    @Override
    public List<ReviewDto> getReviewsByCustomerId(String customerId) {
        return reviewRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewDto getReviewByIdAndCustomerId(String reviewId, String customerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));

        // Check if review belongs to this customer
        if (!review.getCustomer().getUserId().equals(customerId)) {
            throw new RuntimeException("Review does not belong to this customer");
        }

        return convertToDto(review);
    }

    /**
     * Helper method to convert Review entity to ReviewDto
     */
    private ReviewDto convertToDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setReviewId(review.getReviewId());
        dto.setBookId(review.getBook().getBookId());
        dto.setBookTitle(review.getBook().getTitle());
        dto.setBookCover(review.getBook().getCoverImage());
        // thêm tác giả và giá
        dto.setBookAuthor(review.getBook().getAuthor());
        dto.setBookPrice(review.getBook().getPrice());
        dto.setBookDiscountPercent(review.getBook().getDiscountPercent());
        dto.setCustomerId(review.getCustomer().getUserId());
        dto.setCustomerFullName(review.getCustomer().getFullName() != null ? review.getCustomer().getFullName() : "");
        dto.setRating(review.getRating());
        dto.setContent(review.getContent());
        dto.setRatingDate(review.getRatingDate());
        return dto;
    }

    /**
     * Generate a unique review ID
     */
    private String generateReviewId() {
        String maxId = reviewRepository.findMaxReviewId();
        int nextNum = 1;

        if (maxId != null && !maxId.isEmpty()) {
            try {
                // Extract number from format like "REVIEW001"
                if (maxId.startsWith("REVIEW")) {
                    String numberPart = maxId.substring(6); // Get "001" from "REVIEW001"
                    nextNum = Integer.parseInt(numberPart) + 1;
                } else {
                    nextNum = Integer.parseInt(maxId) + 1;
                }
            } catch (NumberFormatException e) {
                nextNum = 1;
            }
        }

        return "REVIEW" + String.format("%03d", nextNum);
    }

    @Override
    public List<ReviewDto> getAllReviews() {

        return reviewRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
