import { FireOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Modal, Row, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import type { Book } from "../types/Book";
import ProductCard from "./ProductCard";
import { API_BASE } from "../config/api";

const { Title } = Typography;

const CARD_WIDTH = 260; // 👈 chỉnh 1 lần cho toàn bộ layout giống nhau

const ProductBestSaler = () => {
  const [booksWeek, setBooksWeek] = useState<Book[]>([]);
  const [booksMonth, setBooksMonth] = useState<Book[]>([]);
  const [booksYear, setBooksYear] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("week");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showAllBooks, setShowAllBooks] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/books/bestsellers/week`);
        const res2 = await fetch(`${API_BASE}/books/bestsellers/month`);
        const res3 = await fetch(`${API_BASE}/books/bestsellers/year`);

        if (!res.ok || !res2.ok || !res3.ok) throw new Error("Fetch error!");

        setBooksWeek(await res.json());
        setBooksMonth(await res2.json());
        setBooksYear(await res3.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setScrollPosition(newPosition);
    }
  };

  const renderBooks = (books: Book[]) =>
    books
      .filter((book) => book.stock > 0)
      .map((book) => (
        <div
          key={book.bookId}
          style={{ minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH }}
        >
          <ProductCard book={book} />
        </div>
      ));

  return (
    <>
      <div style={{ background: "white", padding: "60px 0" }}>
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          {/* Title + Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FireOutlined style={{ fontSize: 32, color: "#C92127" }} />
              <Title level={2} style={{ margin: 0, color: "#C92127" }}>
                Sách Bán Chạy
              </Title>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {["week", "month", "year"].map((t) => (
                <Button
                  key={t}
                  type={activeTab === t ? "primary" : "default"}
                  onClick={() => setActiveTab(t)}
                  style={{
                    background: activeTab === t ? "#C92127" : "transparent",
                    borderColor: "#C92127",
                    color: activeTab === t ? "white" : "#C92127",
                  }}
                >
                  {t === "week" ? "Tuần" : t === "month" ? "Tháng" : "Năm"}
                </Button>
              ))}
            </div>
          </div>

          {/* Carousel */}
          <div style={{ position: "relative", margin: "0 50px" }}>
            <Button
              icon={<LeftOutlined />}
              onClick={() => handleScroll("left")}
              style={buttonStyle("left")}
            />

            <div
              ref={scrollContainerRef}
              style={scrollStyle}
              className="hide-scrollbar"
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  Đang tải...
                </div>
              ) : (
                <>
                  {activeTab === "week" && renderBooks(booksWeek)}
                  {activeTab === "month" && renderBooks(booksMonth)}
                  {activeTab === "year" && renderBooks(booksYear)}
                </>
              )}
            </div>

            <Button
              icon={<RightOutlined />}
              onClick={() => handleScroll("right")}
              style={buttonStyle("right")}
            />
          </div>

          {/* Show All */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Button
              type="link"
              onClick={() => setShowAllBooks(true)}
              style={{ color: "#C92127", fontSize: 16, fontWeight: 500 }}
            >
              Xem thêm →
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FireOutlined style={{ fontSize: 24, color: "#C92127" }} />
            <span style={{ color: "#C92127", fontSize: 20 }}>
              Tất cả sách bán chạy -{" "}
              {activeTab === "week"
                ? "Tuần"
                : activeTab === "month"
                ? "Tháng"
                : "Năm"}
            </span>
          </div>
        }
        open={showAllBooks}
        onCancel={() => setShowAllBooks(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>Đang tải...</div>
        ) : (
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            {activeTab === "week" && renderBooks(booksWeek)}
            {activeTab === "month" && renderBooks(booksMonth)}
            {activeTab === "year" && renderBooks(booksYear)}
          </Row>
        )}
      </Modal>
    </>
  );
};

const buttonStyle = (pos: "left" | "right"): React.CSSProperties => {
  return {
    position: "absolute",
    [pos]: -50,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    border: "1px solid #e8e8e8",
    cursor: "pointer",
  } as React.CSSProperties;
};
const scrollStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  overflowX: "auto",
  padding: "8px 4px",
};

export default ProductBestSaler;
