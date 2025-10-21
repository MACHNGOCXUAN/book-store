package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.CreateReviewRequest;
import iuh.fit.backend.dto.requests.UpdateReviewRequest;
import iuh.fit.backend.dto.responses.ReviewDto;
import iuh.fit.backend.dto.responses.ReviewStatisticsDto;
import iuh.fit.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    /**
     * Get all reviews for a specific book
     * GET /api/reviews/book/{bookId}
     */
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByBookId(@PathVariable String bookId) {
        List<ReviewDto> reviews = reviewService.getReviewsByBookId(bookId);
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
    public ResponseEntity<ReviewDto> createReview(@RequestBody CreateReviewRequest request) {
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
            @RequestBody UpdateReviewRequest request) {
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
            // Verify that the review belongs to the current user if userId provided
            if (userId != null && !userId.isEmpty()) {
                reviewService.getReviewByIdAndCustomerId(reviewId, userId);
            }
            reviewService.deleteReview(reviewId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("does not belong")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own reviews");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /**
     * Get review statistics for a book
     * GET /api/reviews/book/{bookId}/stats
     */
    @GetMapping("/book/{bookId}/stats")
    public ResponseEntity<ReviewStatisticsDto> getReviewStatistics(@PathVariable String bookId) {
        ReviewStatisticsDto stats = reviewService.getReviewStatistics(bookId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all reviews from a specific customer
     * GET /api/reviews/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByCustomerId(@PathVariable String customerId) {
        List<ReviewDto> reviews = reviewService.getReviewsByCustomerId(customerId);
        return ResponseEntity.ok(reviews);
    }
}
