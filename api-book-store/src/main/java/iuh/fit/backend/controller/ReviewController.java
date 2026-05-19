package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.CreateReviewRequest;
import iuh.fit.backend.dto.requests.UpdateReviewRequest;
import iuh.fit.backend.dto.responses.ReviewDto;
import iuh.fit.backend.dto.responses.ReviewStatisticsDto;
import iuh.fit.backend.dto.responses.TopBookDto;
import iuh.fit.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);
    private final ReviewService reviewService;

    /**
     * Get review statistics for a book
     * GET /api/reviews/book/{bookId}/stats
     * NOTE: This must be before /book/{bookId} to avoid routing conflicts
     */
    @GetMapping("/book/{bookId}/stats")
    public ResponseEntity<ReviewStatisticsDto> getReviewStatistics(@PathVariable String bookId) {
        ReviewStatisticsDto stats = reviewService.getReviewStatistics(bookId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all reviews for a specific book
     * GET /api/reviews/book/{bookId}
     * NOTE: This must be before /{reviewId} to avoid routing conflicts
     */
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByBookId(@PathVariable String bookId) {
        List<ReviewDto> reviews = reviewService.getReviewsByBookId(bookId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get all reviews from a specific customer
     * GET /api/reviews/customer/{customerId}
     * NOTE: This must be before /{reviewId} to avoid routing conflicts
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByCustomerId(@PathVariable String customerId) {
        List<ReviewDto> reviews = reviewService.getReviewsByCustomerId(customerId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get a specific review by ID
     * GET /api/reviews/{reviewId}
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewDto> getReviewById(@PathVariable String reviewId) {
        ReviewDto review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    /**
     * Create a new review
     * POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<ReviewDto> createReview(@Valid @RequestBody CreateReviewRequest request) {
        ReviewDto createdReview = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }

    /**
     * Update an existing review
     * PUT /api/reviews/{reviewId}
     * Header: X-User-Id (current user's customer ID - optional for now)
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable String reviewId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody UpdateReviewRequest request) {
        try {
            // Verify that the review belongs to the current user if userId provided
            if (userId != null && !userId.isEmpty()) {
                reviewService.getReviewByIdAndCustomerId(reviewId, userId);
            }
            ReviewDto updatedReview = reviewService.updateReview(reviewId, request);
            return ResponseEntity.ok(updatedReview);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("does not belong")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only update your own reviews");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /**
     * Delete a review
     * DELETE /api/reviews/{reviewId}
     * Header: X-User-Id (current user's customer ID - optional for now)
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable String reviewId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            logger.info("DELETE endpoint called for review: {}, userId: {}", reviewId, userId);

            // Verify that the review belongs to the current user if userId provided
            if (userId != null && !userId.isEmpty()) {
                logger.info("Checking ownership for review: {} by customer: {}", reviewId, userId);
                reviewService.getReviewByIdAndCustomerId(reviewId, userId);
                logger.info("Ownership verified for review: {}", reviewId);
            }

            logger.info("About to delete review: {}", reviewId);
            reviewService.deleteReview(reviewId);
            logger.info("Successfully deleted review: {}", reviewId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting review: {}, error: {}", reviewId, e.getMessage(), e);
            if (e.getMessage().contains("does not belong")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own reviews");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/top10")
    public ResponseEntity<List<TopBookDto>> getTop10Books() {
        return ResponseEntity.ok(reviewService.getTop10Books());
    }


}
