import React from "react"
import { Row, Col, Card, Space, Button, Rate, Divider, Form, Input, Empty } from "antd"
import { StarOutlined, MessageOutlined, LoginOutlined, LogoutOutlined, SendOutlined } from "@ant-design/icons"

// 1. IMPORT COMMENT ITEM
import CommentItem from "./CommentItem" 

// --- INTERFACES (Giữ nguyên) ---
interface Comment {
  review_id: number
  content: string
  rating: number
  rating_date: string
  book_id: number
  customer_id: number
  customer_name: string
}

// SỬA: Thay thế { [key: number]: number } bằng Record<number, number> để rõ ràng hơn
interface RatingStats { [key: number]: number }

interface ReviewSectionProps {
  bookTitle: string
  ratingStats: RatingStats // Đã dùng RatingStats
  totalRatings: number
  averageRating: string
  primaryColor: string
  comments: Comment[]
  isLoggedIn: boolean
  form: any // Ant Design Form Instance
  onCommentSubmit: (values: any) => void
  onToggleLogin: (status: boolean) => void
}
// --- END INTERFACES ---

const ReviewSection: React.FC<ReviewSectionProps> = ({
  bookTitle,
  ratingStats,
  totalRatings,
  averageRating,
  primaryColor,
  comments,
  isLoggedIn,
  form,
  onCommentSubmit,
  onToggleLogin,
}) => {
  
  // Hàm xử lý cuộn khi nhấn nút Đánh giá ngay
  const handleRateNowClick = () => {
    const reviewFormAnchor = document.getElementById('review-form-anchor');
    if (reviewFormAnchor) {
        reviewFormAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  }

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
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "24px" }}>
        <MessageOutlined style={{ marginRight: "8px", color: primaryColor }} />
        Bình luận ({totalRatings})
      </h3>

      <Space direction="vertical" style={{ width: "100%", marginBottom: "32px" }} size="large">
        {comments.length > 0 ? (
          comments.map((comment) => (
            // SỬ DỤNG COMMENT ITEM ĐÃ TÁCH
            <CommentItem 
                key={comment.review_id} 
                comment={comment} 
                primaryColor={primaryColor} // TRUYỀN PRIMARYCOLOR VÀO
            />
          ))
        ) : (
          <Empty description="Chưa có bình luận nào" />
        )}
      </Space>

      <Divider style={{ margin: "32px 0" }} />

      {/* ---------------------------------------------------- */}
      {/* 3. COMMENT SUBMISSION FORM (Giữ nguyên) */}
      {/* ---------------------------------------------------- */}
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "24px" }} id="review-form-anchor">
        {isLoggedIn ? "Viết bình luận của bạn" : "Đăng nhập để bình luận"}
      </h3>

      <Form layout="vertical" onFinish={onCommentSubmit} form={form}>
        <Form.Item
          name="rating"
          label="Đánh giá"
          rules={[{ required: true, message: "Vui lòng chọn đánh giá" }]}
        >
          <Rate style={{ fontSize: "24px" }} disabled={!isLoggedIn}/>
        </Form.Item>

        <Form.Item
          name="content" 
          label="Bình luận"
          rules={[{ required: true, message: "Vui lòng nhập bình luận" }]}
        >
          <Input.TextArea
            placeholder="Mời bạn tham gia thảo luận, vui lòng nhập tiếng Việt có dấu"
            rows={4}
            disabled={!isLoggedIn}
          />
        </Form.Item>
        
        <Form.Item
            name="customer_name"
            label="Tên của bạn"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            style={{ display: isLoggedIn ? 'none' : 'block' }}
        >
          <Input placeholder="Nhập tên của bạn" />
        </Form.Item>

        <Form.Item>
          <Space>
            {!isLoggedIn ? (
              <Button
                type="primary"
                size="large"
                style={{ backgroundColor: primaryColor }}
                icon={<LoginOutlined />}
                onClick={() => onToggleLogin(true)}
              >
                Đăng nhập để bình luận
              </Button>
            ) : (
              <>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{ backgroundColor: "#fbbf24", color: "#000", fontWeight: "bold" }}
                  icon={<SendOutlined />}
                >
                  Gửi bình luận
                </Button>
                <Button size="large" icon={<LogoutOutlined />} onClick={() => onToggleLogin(false)}>
                  Đăng xuất
                </Button>
              </>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ReviewSection