import {
  CrownOutlined,
  GiftOutlined,
  StarOutlined,
  TrophyOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  RocketOutlined,
} from "@ant-design/icons";

import { Button, Card, Col, Row, Typography, Divider } from "antd";

const { Title, Paragraph, Text } = Typography;

const MembershipPage = () => {
  return (
    <div style={{ background: "linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%)" }}>
      {/* Hero Section */}
      <div
        style={{
          padding: "80px 16px",
          textAlign: "center",
          color: "black",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Title level={1} style={{ color: "black", fontSize: "2.5rem", marginBottom: 16 }}>
            👑 Chương trình thành viên BookStore
          </Title>
          <Paragraph style={{ color: "black", fontSize: "1.1rem", opacity: 0.9 }}>
            Nhận ưu đãi độc quyền, tích điểm và khám phá nhiều quyền lợi hấp dẫn khi trở thành
            thành viên của chúng tôi
          </Paragraph>
        </div>
      </div>

      {/* Membership Tiers */}
      <div
        className="container"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 16px" }}
      >
        <Title
          level={2}
          style={{ textAlign: "center", marginBottom: 48, color: "#C92127" }}
        >
          Hạng thành viên
        </Title>

        <Row gutter={[24, 24]}>
          {/* Silver */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: 16,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                background: "linear-gradient(135deg, #f0f0f0 0%, #fafafa 100%)",
              }}
            >
              <CrownOutlined style={{ fontSize: 48, color: "#A0A0A0", marginBottom: 16 }} />
              <Title level={3}>Silver</Title>
              <Paragraph type="secondary">Dành cho khách hàng mới</Paragraph>
              <Divider />
              <Paragraph>
                <CheckCircleOutlined /> Giảm 5% cho mọi đơn hàng
              </Paragraph>
              <Paragraph>
                <GiftOutlined /> Nhận ưu đãi sinh nhật
              </Paragraph>
              <Paragraph>
                <HeartOutlined /> Tích điểm đổi quà
              </Paragraph>
              <Divider />
              <Button
                type="primary"
                style={{
                  background: "#A0A0A0",
                  border: "none",
                  borderRadius: 8,
                  height: 45,
                  fontWeight: 600,
                }}
                block
              >
                Đăng ký ngay
              </Button>
            </Card>
          </Col>

          {/* Gold */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: 16,
                border: "none",
                boxShadow: "0 8px 24px rgba(255,107,53,0.2)",
                background: "linear-gradient(135deg, #FF6B35 0%, #F77F00 100%)",
                color: "white",
              }}
            >
              <TrophyOutlined style={{ fontSize: 48, color: "white", marginBottom: 16 }} />
              <Title level={3} style={{ color: "white" }}>
                Gold
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)" }}>
                Cho khách hàng thân thiết
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Paragraph style={{ color: "white" }}>
                <CheckCircleOutlined /> Giảm 10% cho mọi đơn hàng
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <GiftOutlined /> Quà tặng độc quyền mỗi quý
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <StarOutlined /> Ưu tiên giao hàng
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Button
                type="primary"
                style={{
                  background: "white",
                  color: "#F77F00",
                  border: "none",
                  borderRadius: 8,
                  height: 45,
                  fontWeight: 600,
                }}
                block
              >
                Nâng cấp ngay
              </Button>
            </Card>
          </Col>

          {/* Platinum */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: 16,
                border: "none",
                boxShadow: "0 8px 24px rgba(6,167,125,0.2)",
                background: "linear-gradient(135deg, #06A77D 0%, #028174 100%)",
                color: "white",
              }}
            >
              <StarOutlined style={{ fontSize: 48, color: "white", marginBottom: 16 }} />
              <Title level={3} style={{ color: "white" }}>
                Platinum
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)" }}>
                Đẳng cấp dành cho bạn đọc VIP
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Paragraph style={{ color: "white" }}>
                <CheckCircleOutlined /> Giảm 20% cho mọi đơn hàng
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <GiftOutlined /> Quà tặng sinh nhật đặc biệt
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <CrownOutlined /> Hỗ trợ riêng 24/7
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Button
                type="primary"
                style={{
                  background: "white",
                  color: "#028174",
                  border: "none",
                  borderRadius: 8,
                  height: 45,
                  fontWeight: 600,
                }}
                block
              >
                Trải nghiệm VIP
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Benefits Section */}
      <div style={{ background: "#FFF5F5", padding: "60px 0" }}>
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: 48, color: "#C92127" }}
          >
            Quyền lợi dành riêng cho thành viên
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <GiftOutlined style={{ fontSize: 48, color: "#C92127", marginBottom: 16 }} />
                <Title level={4}>Ưu đãi độc quyền</Title>
                <Paragraph type="secondary">
                  Giảm giá đặc biệt chỉ dành cho thành viên
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <HeartOutlined style={{ fontSize: 48, color: "#FF6B35", marginBottom: 16 }} />
                <Title level={4}>Tích điểm đổi quà</Title>
                <Paragraph type="secondary">
                  Tích điểm mỗi lần mua sắm để nhận quà hấp dẫn
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <RocketOutlined style={{ fontSize: 48, color: "#F77F00", marginBottom: 16 }} />
                <Title level={4}>Giao hàng nhanh</Title>
                <Paragraph type="secondary">
                  Ưu tiên xử lý đơn và vận chuyển siêu tốc
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CustomerServiceOutlined
                  style={{ fontSize: 48, color: "#06A77D", marginBottom: 16 }}
                />
                <Title level={4}>Hỗ trợ riêng</Title>
                <Paragraph type="secondary">
                  Đội ngũ tư vấn tận tâm dành riêng cho hội viên
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
