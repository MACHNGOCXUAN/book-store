import { DeleteOutlined, HeartOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, message } from "antd";
import { useState } from "react";
import type { Book } from "../../types/Book";
import ProductCard from "../../components/ProductCard";

interface FavoriteProductProps {
  favorites?: Book[];
  onRemove?: (bookId: string) => void;
}

const FavoritePage = ({ favorites, onRemove }: FavoriteProductProps) => {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(
    favorites || [
      // Mock data
      {
        bookId: "1",
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        publisher: "NXB Tổng Hợp",
        category: "Kỹ Năng Sống",
        price: 86000,
        stockQuantity: 100,
        soldQuantity: 250,
        discountPercent: 25,
        description: "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử",
        publishDate: "2020-01-01",
        coverImage:
          "https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg",
      },
      {
        bookId: "2",
        title: "Nhà Giả Kim",
        author: "Paulo Coelho",
        publisher: "NXB Hội Nhà Văn",
        category: "Tiểu Thuyết",
        price: 79000,
        stockQuantity: 150,
        soldQuantity: 320,
        discountPercent: 20,
        description: "Câu chuyện về hành trình đi tìm kho báu và ước mơ",
        publishDate: "2019-05-15",
        coverImage:
          "https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_44706.jpg",
      },
      {
        bookId: "3",
        title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
        author: "Rosie Nguyễn",
        publisher: "NXB Hội Nhà Văn",
        category: "Kỹ Năng Sống",
        price: 80000,
        stockQuantity: 200,
        soldQuantity: 180,
        discountPercent: 15,
        description: "Những bài học về cuộc sống và trưởng thành",
        publishDate: "2021-03-20",
        coverImage:
          "https://cdn0.fahasa.com/media/catalog/product/t/u/tuoi-tre-dang-gia-bao-nhieu.jpg",
      },
      {
        bookId: "4",
        title: "Càng Kỷ Luật Càng Tự Do",
        author: "Jocko Willink",
        publisher: "NXB Thế Giới",
        category: "Kỹ Năng Sống",
        price: 108000,
        stockQuantity: 120,
        soldQuantity: 210,
        discountPercent: 30,
        description: "Hướng dẫn xây dựng kỷ luật để đạt được tự do",
        publishDate: "2020-08-10",
        coverImage:
          "https://cdn0.fahasa.com/media/catalog/product/c/a/cang-ky-luat-cang-tu-do.jpg",
      },
    ]
  );

  const handleRemoveFromFavorites = (bookId: string) => {
    setFavoriteBooks(favoriteBooks.filter((book) => book.bookId !== bookId));
    if (onRemove) {
      onRemove(bookId);
    }
    message.success("Đã xóa khỏi danh sách yêu thích!");
  };

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
          {favoriteBooks.map((book) => (
            <Col xs={24} sm={12} md={8} lg={8} key={book.bookId}>
              <div style={{ position: "relative" }}>
                <ProductCard book={book} />

                {/* Remove Button */}
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleRemoveFromFavorites(book.bookId)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  Xóa
                </Button>
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
