import {
  CustomerServiceOutlined,
  RocketOutlined,
  SafetyOutlined,
  ShoppingOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import Banner from "../components/Banner";
import ProductBestSaler from "../components/ProductBestSaler";
import ProductList from "../components/ProductList";

const { Title, Paragraph } = Typography;

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
  return (
    <div>
      {/* Banner Section */}
      <Banner />

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
                styles={{ body: { padding: "32px 24px" } }}
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
                styles={{ body: { padding: "32px 24px" } }}
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
                styles={{ body: { padding: "32px 24px" } }}
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
                styles={{ body: { padding: "32px 24px" } }}
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
                  styles={{
                    body: {
                      padding: "24px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    },
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
