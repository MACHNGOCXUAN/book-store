import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, message, Spin } from "antd";
import { useEffect, useState } from "react";
import type { Book } from "../../types/Book";
import { useAppSelector } from "../../store/hooks";
import { API_BASE } from "../../config/api";
import ProductCard from "../../components/ProductCard";

interface FavoriteProductProps {
  favorites?: Book[];
  onRemove?: (bookId: string) => void;
}

const FavoritePage = (_props: FavoriteProductProps) => {
  const authUser = useAppSelector((s) => s.auth.user);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooksFavorite = async () => {
      if (!authUser?.userId) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/favorites/${authUser?.userId}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setFavoriteBooks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooksFavorite();
  }, []);

  console.log(favoriteBooks);

  const handleRemoveFromFavorites = async (bookId: string) => {
    try {
      setRemoving(bookId);
      const res = await fetch(
        `${API_BASE}/favorites/remove?customerId=${authUser?.userId}&bookId=${bookId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Lỗi xóa yêu thích:", errorText);
        message.error(errorText || "Không thể xóa khỏi danh sách yêu thích");
        return;
      }

      // Cập nhật lại danh sách yêu thích
      setFavoriteBooks((prev) => prev.filter((item) => item.bookId !== bookId));

      message.success("Đã xóa khỏi danh sách yêu thích!");
    } catch (error) {
      console.error("Lỗi khi gọi API xóa yêu thích:", error);
      message.error("Không thể kết nối đến máy chủ");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin tip="Đang tải danh sách yêu thích..." size="large" />
      </div>
    );
  }

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          <HeartOutlined style={{ marginRight: 8, color: "#C92127" }} />
          Sản phẩm yêu thích
          <span
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: 400,
              color: "#666",
            }}
          >
            ({favoriteBooks.length} sản phẩm)
          </span>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {favoriteBooks.length > 0 ? (
        <Row gutter={[16, 16]}>
          {favoriteBooks
            .filter((b) => b.stock > 0)
            .map((book) => (
              <Col xs={24} sm={12} md={8} lg={8} key={book.bookId}>
                <div style={{ position: "relative" }}>
                  <ProductCard book={book} />

                  {/* Remove Button - Heart Icon */}
                  <Button
                    type="text"
                    icon={
                      <HeartFilled style={{ fontSize: 24, color: "#C92127" }} />
                    }
                    loading={removing === book.bookId}
                    onClick={() => handleRemoveFromFavorites(book.bookId)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 10,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      border: "none",
                    }}
                    title="Xóa khỏi danh sách yêu thích"
                  />
                </div>
              </Col>
            ))}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <div style={{ marginBottom: 8 }}>Chưa có sản phẩm yêu thích</div>
              <div style={{ fontSize: 13, color: "#999" }}>
                Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi!
              </div>
            </div>
          }
          style={{ padding: "60px 0" }}
        >
          <Button
            type="primary"
            style={{
              background: "#C92127",
              borderColor: "#C92127",
              borderRadius: 8,
              marginTop: 16,
            }}
            onClick={() => (window.location.href = "/")}
          >
            Khám phá sản phẩm
          </Button>
        </Empty>
      )}

      {favoriteBooks.length > 0 && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#FFF5F5",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: "#666" }}>
            💡 <strong>Mẹo:</strong> Thêm sản phẩm vào yêu thích để nhận thông
            báo khi có khuyến mãi!
          </div>
        </div>
      )}
    </Card>
  );
};

export default FavoritePage;
