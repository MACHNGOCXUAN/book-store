import {
  CustomerServiceOutlined,
  FireOutlined,
  LeftOutlined,
  RightOutlined,
  RocketOutlined,
  SafetyOutlined,
  ShoppingOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Modal, Row, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductList from "../components/ProductList";

// Import banner images
import banner1 from "../assets/paner/25_840x320.png";
import banner2 from "../assets/paner/SBOOKS10_KC_Resize_840x320.jppg.webp";
import banner3 from "../assets/paner/TrangHalloween10_Resize840x320.jpg";
import banner4 from "../assets/paner/Vang_MCBooks_Mainbanner840x320_fix.jpg";

// Import mini banner images
import miniBanner1 from "../assets/paner_mini/chienthannguvan_310x210_1.jpg";
import miniBanner2 from "../assets/paner_mini/NgoaiVanT10_Resize_310x210_1.jpg";
import miniBanner3 from "../assets/paner_mini/trangphunu_310x210.jpg";
import miniBanner4 from "../assets/paner_mini/Vang_MCBooks_Resize_310x210.jpg";

const { Title, Paragraph } = Typography;

const bannerImages = [banner1, banner2, banner3, banner4];
const miniBannerImages = [
  { img: miniBanner1, alt: "Chiến thần ngữ văn" },
  { img: miniBanner2, alt: "Ngoại văn T10" },
  { img: miniBanner3, alt: "Trang phụ nữ" },
  { img: miniBanner4, alt: "MC Books" },
];

// Mock data for bestselling books
const mockBestsellingBooks = [
  {
    bookId: "1",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    publisher: "NXB Tổng Hợp",
    category: "Kỹ năng sống",
    price: 86000,
    stock: 150,
    description: "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử",
    publishDate: "2020-01-15",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "2",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    publisher: "NXB Hội Nhà Văn",
    category: "Tiểu thuyết",
    price: 67000,
    stock: 200,
    description:
      "Câu chuyện về hành trình tìm kiếm kho báu và ý nghĩa cuộc sống",
    publishDate: "2019-05-20",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "3",
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    author: "Rosie Nguyễn",
    publisher: "NXB Hội Nhà Văn",
    category: "Kỹ năng sống",
    price: 72000,
    stock: 180,
    description: "Những trải nghiệm và bài học quý giá cho tuổi trẻ",
    publishDate: "2021-03-10",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "4",
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    publisher: "NXB Trẻ",
    category: "Lịch sử",
    price: 189000,
    stock: 120,
    description: "Câu chuyện về sự tiến hóa của loài người",
    publishDate: "2018-08-15",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "5",
    title: "Atomic Habits",
    author: "James Clear",
    publisher: "NXB Thế Giới",
    category: "Kỹ năng sống",
    price: 179000,
    stock: 95,
    description: "Cách xây dựng thói quen tốt và phá bỏ thói quen xấu",
    publishDate: "2020-11-25",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "6",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    publisher: "NXB Thế Giới",
    category: "Tâm lý học",
    price: 165000,
    stock: 88,
    description: "Khám phá hai hệ thống tư duy của con người",
    publishDate: "2019-07-10",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "7",
    title: "Tôi Tài Giỏi, Bạn Cũng Thế",
    author: "Adam Khoo",
    publisher: "NXB Tổng Hợp",
    category: "Kỹ năng sống",
    price: 99000,
    stock: 145,
    description: "Phương pháp học tập hiệu quả cho học sinh",
    publishDate: "2020-09-18",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "8",
    title: "Làm Chủ Cảm Xúc",
    author: "Nghiêm Thùy Chi",
    publisher: "NXB Lao Động",
    category: "Tâm lý học",
    price: 89000,
    stock: 167,
    description: "Hướng dẫn kiểm soát và quản lý cảm xúc",
    publishDate: "2021-06-22",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "9",
    title: "Nghệ Thuật Sống",
    author: "Arthur Schopenhauer",
    publisher: "NXB Văn Học",
    category: "Triết học",
    price: 125000,
    stock: 73,
    description: "Những triết lý về cuộc sống và hạnh phúc",
    publishDate: "2019-12-05",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
  {
    bookId: "10",
    title: "Người Giàu Có Nhất Babylon",
    author: "George S. Clason",
    publisher: "NXB Tổng Hợp",
    category: "Tài chính",
    price: 95000,
    stock: 134,
    description: "Bí quyết làm giàu từ thành phố cổ đại",
    publishDate: "2020-03-30",
    coverImage:
      "https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/aa81d0a534b45706ae1eee1e344e80d9.jpg",
  },
];

// Famous book brands
const famousBrands = [
  {
    name: "NXB Kim Đồng",
    logo: "https://cdn0.fahasa.com/media/wysiwyg/Duy-VHDT/Thuong_hieu_NCCBH.jpg",
  },
  {
    name: "IPM",
    logo: "https://cdn0.fahasa.com/media/wysiwyg/Duy-VHDT/Thuong_hieu_IPM.jpg",
  },
  {
    name: "Nhã Nam",
    logo: "https://cdn0.fahasa.com/media/wysiwyg/Duy-VHDT/Thuong_hieu_Nha_Nam.jpg",
  },
  {
    name: "Alphabooks",
    logo: "https://cdn0.fahasa.com/media/wysiwyg/Duy-VHDT/Thuong_hieu_AlphaBook.jpg",
  },
  {
    name: "Thái Hà",
    logo: "https://cdn0.fahasa.com/media/wysiwyg/Duy-VHDT/Thuong_hieu_Thai_ha.jpg",
  },
  {
    name: "MeBook",
    logo: "https://cdn0.fahasa.com/media/wysiwyg/Duy-VHDT/Thuong_hieu_mebook.jpg",
  },
];

const HomePage = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeTab, setActiveTab] = useState("week");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showAllBooks, setShowAllBooks] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 6000); // Change image every 3 seconds

    return () => clearInterval(interval);
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

  return (
    <div>
      {/* Hero Banner Section with Image Carousel */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#f5f5f5",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
            paddingTop: 20,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "320px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {bannerImages.map((image, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: currentBanner === index ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ))}

            {/* Navigation Dots */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                zIndex: 10,
              }}
            >
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "2px solid white",
                    background:
                      currentBanner === index ? "white" : "transparent",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.3s ease",
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mini Banners Section */}
      <div
        style={{
          background: "#f5f5f5",
          padding: "16px 0",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          <Row gutter={[16, 16]}>
            {miniBannerImages.map((banner, index) => (
              <Col key={index} xs={24} sm={12} md={6}>
                <div
                  style={{
                    width: "100%",
                    height: "210px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(201,33,39,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  <img
                    src={banner.img}
                    alt={banner.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: "#FFF5F5", padding: "60px 0" }}>
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: 48, color: "#C92127" }}
          >
            Tại sao chọn chúng tôi?
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "32px 24px" }}
              >
                <ShoppingOutlined
                  style={{ fontSize: 48, color: "#C92127", marginBottom: 16 }}
                />
                <Title level={4} style={{ marginBottom: 8 }}>
                  Đa dạng sản phẩm
                </Title>
                <Paragraph type="secondary">
                  Hàng ngàn đầu sách từ nhiều thể loại khác nhau
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "32px 24px" }}
              >
                <RocketOutlined
                  style={{ fontSize: 48, color: "#FF6B35", marginBottom: 16 }}
                />
                <Title level={4} style={{ marginBottom: 8 }}>
                  Giao hàng nhanh
                </Title>
                <Paragraph type="secondary">
                  Miễn phí ship cho đơn hàng trên 200k
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "32px 24px" }}
              >
                <SafetyOutlined
                  style={{ fontSize: 48, color: "#F77F00", marginBottom: 16 }}
                />
                <Title level={4} style={{ marginBottom: 8 }}>
                  Thanh toán an toàn
                </Title>
                <Paragraph type="secondary">
                  Bảo mật thông tin 100% khi thanh toán
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "32px 24px" }}
              >
                <CustomerServiceOutlined
                  style={{ fontSize: 48, color: "#06A77D", marginBottom: 16 }}
                />
                <Title level={4} style={{ marginBottom: 8 }}>
                  Hỗ trợ 24/7
                </Title>
                <Paragraph type="secondary">
                  Đội ngũ tư vấn nhiệt tình, chuyên nghiệp
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Bestselling Books Section */}
      <div style={{ background: "white", padding: "60px 0" }}>
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
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
              <Button
                type={activeTab === "week" ? "primary" : "default"}
                onClick={() => setActiveTab("week")}
                style={{
                  background: activeTab === "week" ? "#C92127" : "transparent",
                  borderColor: "#C92127",
                  color: activeTab === "week" ? "white" : "#C92127",
                }}
              >
                Tuần
              </Button>
              <Button
                type={activeTab === "month" ? "primary" : "default"}
                onClick={() => setActiveTab("month")}
                style={{
                  background: activeTab === "month" ? "#C92127" : "transparent",
                  borderColor: "#C92127",
                  color: activeTab === "month" ? "white" : "#C92127",
                }}
              >
                Tháng
              </Button>
              <Button
                type={activeTab === "year" ? "primary" : "default"}
                onClick={() => setActiveTab("year")}
                style={{
                  background: activeTab === "year" ? "#C92127" : "transparent",
                  borderColor: "#C92127",
                  color: activeTab === "year" ? "white" : "#C92127",
                }}
              >
                Năm
              </Button>
            </div>
          </div>

          {/* Carousel Container */}
          <div style={{ position: "relative" }}>
            {/* Left Arrow */}
            <Button
              icon={<LeftOutlined />}
              onClick={() => handleScroll("left")}
              style={{
                position: "absolute",
                left: -20,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "1px solid #e8e8e8",
              }}
            />

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              style={{
                display: "flex",
                gap: 16,
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                padding: "8px 0",
              }}
              className="hide-scrollbar"
            >
              {mockBestsellingBooks.map((book) => (
                <div
                  key={book.bookId}
                  style={{
                    minWidth: 200,
                    flex: "0 0 auto",
                  }}
                >
                  <ProductCard book={book} />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <Button
              icon={<RightOutlined />}
              onClick={() => handleScroll("right")}
              style={{
                position: "absolute",
                right: -20,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "1px solid #e8e8e8",
              }}
            />
          </div>

          {/* View More Button */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Button
              type="link"
              onClick={() => setShowAllBooks(true)}
              style={{
                color: "#C92127",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              Xem thêm →
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for All Books */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FireOutlined style={{ fontSize: 24, color: "#C92127" }} />
            <span style={{ color: "#C92127", fontSize: 20 }}>
              Tất cả sách bán chạy
            </span>
          </div>
        }
        open={showAllBooks}
        onCancel={() => setShowAllBooks(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {mockBestsellingBooks.map((book) => (
            <Col key={book.bookId} xs={12} sm={8} md={6} lg={4.8}>
              <ProductCard book={book} />
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Famous Brands Section */}
      <div style={{ background: "#f5f5f5", padding: "60px 0" }}>
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <TrophyOutlined style={{ fontSize: 32, color: "#C92127" }} />
            <Title level={2} style={{ margin: 0, color: "#C92127" }}>
              Thương Hiệu Nổi Tiếng
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            {famousBrands.map((brand, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={4}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: "1px solid #e8e8e8",
                    background: "white",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{
                    padding: "24px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#C92127";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(201,33,39,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e8e8e8";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "80px",
                      objectFit: "contain",
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Products Section */}
      <ProductList />
    </div>
  );
};

export default HomePage;
