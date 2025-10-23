import {
  CustomerServiceOutlined,
  RocketOutlined,
  SafetyOutlined,
  ShoppingOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import ProductBestSaler from "../components/ProductBestSaler";
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 6000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
      <ProductBestSaler />

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
