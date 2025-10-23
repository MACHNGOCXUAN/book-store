import React, { useState } from "react"
import { Row, Col, Card, Space, Button, Rate, Divider, Form, Input, Empty } from "antd"
import { StarOutlined, MessageOutlined, SendOutlined } from "@ant-design/icons"

// 1. IMPORT COMMENT ITEM

// Import types
import type { Comment } from "../types"
import ReviewItem from "./ReviewItem";

/* ===================== ReviewSection Types ===================== */
export type RatingStats = Record<number, number>;

interface ReviewSectionProps {
  bookTitle: string;
  ratingStats: RatingStats;
  totalRatings: number;
  averageRating: string;
  primaryColor: string;
  comments: Comment[];
  isLoggedIn: boolean;
  form: any; // Ant Design Form Instance
  currentUserId?: string;
  onCommentSubmit: (values: any) => void;
  onEditComment?: (reviewId: string | number, rating: number, content: string) => Promise<void>;
  onDeleteComment?: (reviewId: string | number) => Promise<void>;
  onToggleLogin?: (status: boolean) => void;
}

const REVIEWS_PER_PAGE = 3; // Hiển thị 3 bình luận mỗi trang

const ReviewSection: React.FC<ReviewSectionProps> = ({
  bookTitle,
  ratingStats,
  totalRatings,
  averageRating,
  primaryColor,
  comments,
  isLoggedIn,
  form,
  currentUserId,
  onCommentSubmit,
  onEditComment,
  onDeleteComment,
}) => {
  const [displayedCount, setDisplayedCount] = useState(REVIEWS_PER_PAGE);
  
  // Hàm xử lý cuộn khi nhấn nút Đánh giá ngay
  const handleRateNowClick = () => {
    const reviewFormAnchor = document.getElementById('review-form-anchor');
    if (reviewFormAnchor) {
        reviewFormAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Hàm xử lý xem thêm bình luận
  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + REVIEWS_PER_PAGE);
  }

  // Lấy bình luận hiển thị
  const displayedComments = comments.slice(0, displayedCount);
  const hasMore = displayedCount < comments.length;

  return (
    <Card style={{ marginBottom: "32px" }}>
      {/* ---------------------------------------------------- */}
      {/* 1. RATING STATISTICS & SUMMARY (Giữ nguyên) */}
      {/* ---------------------------------------------------- */}
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
        <StarOutlined style={{ marginRight: "8px", color: primaryColor }} />
        Đánh giá {bookTitle}
      </h2>

      <Row gutter={[32, 32]}>
        {/* Left: Star Distribution Bars */}
        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingStats[stars as keyof RatingStats] // SỬA: Loại bỏ typeof
              const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
              return (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "bold", width: "32px" }}>{stars}★</span>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: primaryColor,
                        width: `${percentage}%`,
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: "14px", color: "#1890ff", minWidth: "80px" }}>
                    {percentage}% | {count} đánh giá
                  </span>
                </div>
              )
            })}
          </Space>
        </Col>

        {/* Right: Average Rating and Action Button */}
        <Col
          xs={24}
          md={12}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: primaryColor }}>{averageRating}</div>
            <Rate disabled value={Math.round(Number(averageRating))} style={{ fontSize: "20px" }} />
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>({totalRatings} đánh giá)</p>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleRateNowClick}
            style={{
              backgroundColor: "#0891b2",
              height: "48px",
              fontSize: "16px",
              fontWeight: "bold",
              paddingLeft: "32px",
              paddingRight: "32px",
            }}
          >
            ĐÁNH GIÁ NGAY
          </Button>
        </Col>
      </Row>

      <Divider style={{ margin: "32px 0" }} />

      {/* ---------------------------------------------------- */}
      {/* 2. COMMENTS LIST (Sử dụng Component CommentItem) */}
      {/* ---------------------------------------------------- */}
      {isLoggedIn ? (
        <>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "24px" }}>
            <MessageOutlined style={{ marginRight: "8px", color: primaryColor }} />
            Bình luận ({totalRatings})
          </h3>

          <Space direction="vertical" style={{ width: "100%", marginBottom: "32px" }} size="large">
            {comments.length > 0 ? (
              <>
                {displayedComments.map((comment) => {
                  const isCurrentUser = (comment.customerId || comment.customer_id) === currentUserId;
                  console.log("ReviewItem render:", {
                    reviewId: comment.review_id,
                    customerId: comment.customerId || comment.customer_id,
                    currentUserId,
                    isCurrentUser,
                    comment
                  });
                  return (
                    <ReviewItem 
                        key={comment.review_id} 
                        comment={comment} 
                        primaryColor={primaryColor}
                        isCurrentUserComment={isCurrentUser}
                        onEdit={onEditComment}
                        onDelete={onDeleteComment}
                    />
                  );
                })}
                
                {/* Nút Xem thêm */}
                {hasMore && (
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <Button
                      type="default"
                      size="large"
                      onClick={handleLoadMore}
                      style={{
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #d9d9d9",
                        color: "#000",
                        fontWeight: "500",
                        minWidth: "200px",
                      }}
                    >
                      Xem thêm ({comments.length - displayedCount} bình luận)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Empty description="Chưa có bình luận nào" />
            )}
          </Space>
        </>
      ) : (
        <Card
          style={{
            backgroundColor: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "8px",
            marginBottom: "32px",
            textAlign: "center",
            padding: "32px 24px",
          }}
        >
          <p style={{ fontSize: "16px", color: "#92400e", margin: "0 0 16px 0", fontWeight: "500" }}>
            Chỉ có thành viên mới có thể viết nhận xét. Vui lòng đăng nhập hoặc đăng ký.
          </p>
          
        </Card>
      )}

      <Divider style={{ margin: "32px 0" }} />

      {/* ---------------------------------------------------- */}
      {/* 3. COMMENT SUBMISSION FORM */}
      {/* ---------------------------------------------------- */}
      {isLoggedIn && (
        <>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "24px" }} id="review-form-anchor">
            Viết bình luận của bạn
          </h3>

          <Form layout="vertical" onFinish={onCommentSubmit} form={form}>
            <Form.Item
              name="rating"
              label="Đánh giá"
              rules={[{ required: true, message: "Vui lòng chọn đánh giá" }]}
            >
              <Rate style={{ fontSize: "24px" }} />
            </Form.Item>

            <Form.Item
              name="content" 
              label="Bình luận"
              rules={[{ required: true, message: "Vui lòng nhập bình luận" }]}
            >
              <Input.TextArea
                placeholder="Mời bạn tham gia thảo luận, vui lòng nhập tiếng Việt có dấu"
                rows={4}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ backgroundColor: "#fbbf24", color: "#000", fontWeight: "bold" }}
                icon={<SendOutlined />}
              >
                Gửi bình luận
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </Card>
  )
}

export default ReviewSection