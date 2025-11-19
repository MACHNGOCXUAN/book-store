import {
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Form,
  Image,
  Layout,
  Row,
  Space,
  Spin,
  Tabs,
  message,
  App,
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewSection from "../components/ReviewSection.tsx";
import { API_BASE } from "../config/api.ts";
import { getBookById } from "../features/books/bookSlice";
import { addOrUpdateCartItem } from "../features/cart/cartSlice";
import { reviewApi } from "../features/reviews/reviewSlice.ts";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Comment } from "../types";

function DetailPage() {
  const { id } = useParams<string>();
  const dispatch = useAppDispatch();
  const reduxBook = useAppSelector((s) => {
    const foundBook = s.books.books.find((b) => b.bookId === id);
    return foundBook || null;
  });

  // Get user from auth store
  const authUser = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!token && !!authUser);
  const [isFavorite, setIsFavorite] = useState(false);
  const [form] = Form.useForm();
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleAddToCart = async () => {
    try {
      if (id) {
        await dispatch(
          addOrUpdateCartItem({ bookId: id, quantity: 1 })
        ).unwrap();
        toast.success("Đã thêm vào giỏ hàng 🎉");
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi thêm sản phẩm 😢");
    }
  };

  const handleAddFavorite = async () => {
    try {
      if (!isLoggedIn) {
        toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
        return;
      }

      const token = localStorage.getItem("access_token");

      if (isFavorite) {
        // Remove from favorites
        const res = await fetch(
          `${API_BASE}/favorites/remove?customerId=${authUser?.userId}&bookId=${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setIsFavorite(false);
        toast.success("Đã xóa khỏi yêu thích");
      } else {
        // Add to favorites
        const res = await fetch(
          `${API_BASE}/favorites/add?customerId=${authUser?.userId}&bookId=${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setIsFavorite(true);
        toast.success("Đã thêm vào yêu thích ❤️");
      }
    } catch (err: any) {
      toast.error(
        isFavorite ? "Lỗi khi xóa yêu thích" : "Lỗi khi thêm vào yêu thích"
      );
    }
  };

  useEffect(() => {
    // Update login state when auth changes
    setIsLoggedIn(!!token && !!authUser);
  }, [token, authUser]);

  useEffect(() => {
    if (id) {
      dispatch(getBookById(id));
      loadReviews();
    }
  }, [id, dispatch]);

  const loadReviews = async () => {
    if (!id) return;
    try {
      setLoadingReviews(true);
      const reviews = await reviewApi.getReviewsByBookId(id);
      setComments(reviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
      message.error("Không thể tải bình luận");
    } finally {
      setLoadingReviews(false);
    }
  };

  const ratingStats = {
    5: comments.filter((c) => c.rating === 5).length,
    4: comments.filter((c) => c.rating === 4).length,
    3: comments.filter((c) => c.rating === 3).length,
    2: comments.filter((c) => c.rating === 2).length,
    1: comments.filter((c) => c.rating === 1).length,
  };

  const totalRatings = comments.length;
  const averageRating =
    totalRatings > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / totalRatings).toFixed(
          1
        )
      : "0";

  const handleCommentSubmit = async (values: any) => {
    if (!isLoggedIn || !authUser) {
      toast.warning("Vui lòng đăng nhập để bình luận");
      return;
    }

    try {
      // Validate input
      if (!values.rating || values.rating < 1 || values.rating > 5) {
        toast.error("Vui lòng chọn đánh giá từ 1 đến 5 sao");
        return;
      }

      if (!values.content || values.content.trim().length < 10) {
        toast.error("Bình luận phải có ít nhất 10 ký tự");
        return;
      }

      // Call API to create review with actual user ID
      const payload = {
        bookId: id || "",
        customerId: authUser.userId || "1",
        rating: values.rating || 0,
        content: values.content.trim() || "",
      };

      const newReview = await reviewApi.createReview(payload);

      // API already normalizes the data, just add to state
      setComments([newReview, ...comments]);
      form.resetFields();
      toast.success("Bình luận của bạn đã được gửi ✅");
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      toast.error(error.message || "Lỗi khi gửi bình luận 😢");
    }
  };

  const handleEditComment = async (
    reviewId: string | number,
    rating: number,
    content: string
  ) => {
    try {
      // Validate input
      if (rating < 1 || rating > 5) {
        toast.error("Vui lòng chọn đánh giá từ 1 đến 5 sao");
        return;
      }

      if (!content || content.trim().length < 10) {
        toast.error("Bình luận phải có ít nhất 10 ký tự");
        return;
      }

      console.log("Updating review:", {
        reviewId,
        rating,
        content,
        userId: authUser?.userId,
      });

      const updateResult = await reviewApi.updateReview(
        String(reviewId),
        { rating, content: content.trim() },
        authUser?.userId
      );
      console.log("Update result:", updateResult);

      // Fetch lại reviews để cập nhật toàn bộ dữ liệu (bao gồm rating_date)
      if (id) {
        console.log("Fetching updated reviews for book:", id);
        const updatedReviews = await reviewApi.getReviewsByBookId(id);
        console.log("Updated reviews:", updatedReviews);
        setComments(updatedReviews);
      }
      toast.success("Bình luận đã được cập nhật ✅");
    } catch (error: any) {
      console.error("Error updating comment:", error);
      if (
        error.message.includes("does not belong") ||
        error.message.includes("FORBIDDEN")
      ) {
        toast.error("Bạn chỉ có thể chỉnh sửa bình luận của chính mình 😢");
      } else if (error.message.includes("Character")) {
        toast.error("Bình luận phải có ít nhất 10 ký tự 😢");
      } else {
        toast.error(error.message || "Lỗi khi cập nhật bình luận 😢");
      }
    }
  };

  const handleDeleteComment = async (reviewId: string | number) => {
    try {
      console.log("🗑️ handleDeleteComment called with reviewId:", reviewId);
      if (!reviewId) {
        toast.error("ID bình luận không hợp lệ");
        return;
      }

      console.log(
        "🗑️ Calling reviewApi.deleteReview with userId:",
        authUser?.userId
      );
      await reviewApi.deleteReview(String(reviewId), authUser?.userId);
      console.log("🗑️ deleteReview returned successfully");

      // Fetch lại reviews để cập nhật toàn bộ dữ liệu
      if (id) {
        console.log("🗑️ Fetching updated reviews for bookId:", id);
        const updatedReviews = await reviewApi.getReviewsByBookId(id);
        console.log("🗑️ Updated reviews:", updatedReviews);
        setComments(updatedReviews);
      }
      toast.success("Bình luận đã được xóa ✅");
    } catch (error: any) {
      console.error("❌ Error deleting comment:", error);
      if (
        error.message.includes("does not belong") ||
        error.message.includes("FORBIDDEN")
      ) {
        toast.error("Bạn chỉ có thể xóa bình luận của chính mình 😢");
      } else {
        toast.error(error.message || "Lỗi khi xóa bình luận 😢");
      }
    }
  };

  const handleToggleLogin = (status: boolean) => {
    if (status) {
      // Open login modal - navigate to login or show modal
      // For now, just set the state. In production, navigate to /login
      toast.info("Vui lòng đăng nhập tài khoản của bạn");
      window.location.href = "/login";
    } else {
      setIsLoggedIn(false);
      form.resetFields();
    }
  };

  if (!reduxBook) return <div style={{ padding: "32px" }}>Đang tải...</div>;

  const primaryColor = "rgb(207, 38, 45)";
  const originalPrice = reduxBook.price;
  const discountAmount = (reduxBook.price * reduxBook.discountPercent) / 100;
  const discountedPrice = reduxBook.price - discountAmount;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
          borderRadius: 8,
        },
      }}
    >
      <App>
        <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
          <div
            style={{
              backgroundColor: "#fff",
              borderBottom: "1px solid #f0f0f0",
              padding: "12px 24px",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Trang chủ /{" "}
              {typeof reduxBook.category === "string"
                ? reduxBook.category
                : reduxBook.category?.categoryName}{" "}
              / {reduxBook.publisher}
            </p>
          </div>

          <Layout.Content style={{ padding: "32px 24px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <Row gutter={[32, 32]} style={{ marginBottom: "32px" }}>
                <Col xs={24} lg={8}>
                  <Card
                    style={{
                      position: "relative",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Floating Heart Button */}
                    <Button
                      type="text"
                      icon={
                        isFavorite ? (
                          <HeartFilled
                            style={{
                              fontSize: 28,
                              color: "#C92127",
                            }}
                          />
                        ) : (
                          <HeartOutlined
                            style={{
                              fontSize: 28,
                              color: "#C92127",
                              strokeWidth: 1.5,
                            }}
                          />
                        )
                      }
                      onClick={handleAddFavorite}
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 10,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.95)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        border: "1px solid #f0f0f0",
                      }}
                      title={
                        isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
                      }
                    />

                    <Image
                      src={reduxBook.coverImage || "/placeholder.svg"}
                      alt={reduxBook.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      preview={{
                        mask: "Xem ảnh to",
                      }}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Card>
                    <h1
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginBottom: "24px",
                        color: "#000",
                      }}
                    >
                      {reduxBook.title}
                    </h1>

                    <div style={{ marginBottom: "24px" }}>
                      <Space size="large">
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#999",
                            fontSize: "18px",
                          }}
                        >
                          {originalPrice.toLocaleString()}₫
                        </span>
                        <span
                          style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: primaryColor,
                          }}
                        >
                          {discountedPrice.toLocaleString()}₫
                        </span>
                      </Space>
                    </div>

                    <Space
                      direction="vertical"
                      style={{ width: "100%", marginBottom: "24px" }}
                      size="middle"
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        block
                        style={{
                          backgroundColor: primaryColor,
                          height: "48px",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                        onClick={() => {
                          handleAddToCart();
                        }}
                      >
                        Thêm vào giỏ hàng
                      </Button>
                      <Button
                        size="large"
                        icon={<CreditCardOutlined />}
                        block
                        style={{
                          backgroundColor: "#e91e63",
                          color: "#fff",
                          height: "48px",
                          fontSize: "16px",
                          fontWeight: "bold",
                          border: "none",
                        }}
                      >
                        Thanh toán ngay
                      </Button>
                    </Space>

                    <Card
                      style={{
                        backgroundColor: "#f6ffed",
                        border: "1px solid #b7eb8f",
                        marginTop: "16px",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                        Nếu bạn cần hỗ trợ trong quá trình thanh toán, xin hãy
                        liên hệ qua{" "}
                        <span style={{ color: "#e91e63", fontWeight: "bold" }}>
                          Zalo
                        </span>{" "}
                        để được tư vấn nhanh nhất.
                      </p>
                    </Card>
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Card>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "24px",
                        color: primaryColor,
                      }}
                    >
                      Tiêu chí của chúng tôi
                    </h3>
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {[
                        {
                          icon: <CalendarOutlined />,
                          title: "Phiên bản mới nhất",
                          desc: "Liên tục cập nhật",
                        },
                        {
                          icon: <GiftOutlined />,
                          title: "Mức giá phù hợp",
                          desc: "Tiết kiệm hơn 10 lần",
                        },
                        {
                          icon: <CheckCircleOutlined />,
                          title: "An toàn & Uy tín",
                          desc: "Hơn 3.000 khách hàng",
                        },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "12px" }}>
                          <div
                            style={{
                              fontSize: "24px",
                              color: "#999",
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: "bold",
                                color: "#000",
                              }}
                            >
                              {item.title}
                            </p>
                            <p
                              style={{
                                margin: "4px 0 0 0",
                                fontSize: "14px",
                                color: "#666",
                              }}
                            >
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Card style={{ marginBottom: 30 }}>
                <Tabs
                  items={[
                    {
                      key: "description",
                      label: (
                        <span>
                          <FileTextOutlined style={{ marginRight: "8px" }} />
                          Mô tả
                        </span>
                      ),
                      children: (
                        <div style={{ color: "#333", lineHeight: "1.6" }}>
                          <p>{reduxBook.description}</p>
                          <p>
                            <strong>Tác giả:</strong> {reduxBook.author}
                          </p>
                          <p>
                            <strong>Nhà xuất bản:</strong> {reduxBook.publisher}
                          </p>
                          <p>
                            <strong>Ngày xuất bản:</strong>{" "}
                            {reduxBook.publishDate}
                          </p>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>

              <Spin
                spinning={loadingReviews}
                fullscreen={false}
                tip="Đang tải bình luận..."
              >
                <ReviewSection
                  bookTitle={reduxBook.title}
                  ratingStats={ratingStats}
                  totalRatings={totalRatings}
                  averageRating={averageRating}
                  primaryColor={primaryColor}
                  comments={comments}
                  isLoggedIn={isLoggedIn}
                  form={form}
                  currentUserId={authUser?.userId}
                  onCommentSubmit={handleCommentSubmit}
                  onToggleLogin={handleToggleLogin}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                />
              </Spin>
            </div>
          </Layout.Content>
        </Layout>
      </App>
    </ConfigProvider>
  );
}

export default DetailPage;
