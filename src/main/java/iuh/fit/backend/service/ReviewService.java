package iuh.fit.backend.service;

import iuh.fit.backend.dto.requests.CreateReviewRequest;
import iuh.fit.backend.dto.requests.UpdateReviewRequest;
import iuh.fit.backend.dto.responses.ReviewDto;
import iuh.fit.backend.dto.responses.ReviewStatisticsDto;

import java.util.List;

public interface ReviewService {
    List<ReviewDto> getReviewsByBookId(String bookId);
    ReviewDto getReviewById(String reviewId);
    ReviewDto createReview(CreateReviewRequest request);
    ReviewDto updateReview(String reviewId, UpdateReviewRequest request);
    void deleteReview(String reviewId);
    ReviewStatisticsDto getReviewStatistics(String bookId);
    List<ReviewDto> getReviewsByCustomerId(String customerId);
    ReviewDto getReviewByIdAndCustomerId(String reviewId, String customerId);
}
