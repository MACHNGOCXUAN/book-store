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
    <div
      style={{
        background: "linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%)",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          padding: "80px 16px",
          textAlign: "center",
          color: "black",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Title
            level={1}
            style={{ color: "black", fontSize: "2.5rem", marginBottom: 16 }}
          >
            👑 Chương trình thành viên BookStore
          </Title>
          <Paragraph
            style={{ color: "black", fontSize: "1.1rem", opacity: 0.9 }}
          >
            Nhận ưu đãi độc quyền, tích điểm và khám phá nhiều quyền lợi hấp dẫn
            khi trở thành thành viên của chúng tôi
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
          {/* NEW_USER */}
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
              <CrownOutlined
                style={{ fontSize: 48, color: "#A0A0A0", marginBottom: 16 }}
              />
              <Title level={3}>Người dùng mới</Title>
              <Paragraph type="secondary">
                Bắt đầu hành trình thành viên
              </Paragraph>
              <Divider />
              <Paragraph>
                <CheckCircleOutlined /> Tích điểm từ mỗi mua hàng
              </Paragraph>
              <Paragraph>
                <GiftOutlined /> Mã giảm giá welcome
              </Paragraph>
              <Paragraph>
                <HeartOutlined /> Tích điểm để lên hạng
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
                disabled
                block
              >
                Hạng hiện tại
              </Button>
            </Card>
          </Col>

          {/* REGULAR */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: 16,
                border: "none",
                boxShadow: "0 8px 24px rgba(255,152,0,0.2)",
                background: "linear-gradient(135deg, #FF9800 0%, #FB8C00 100%)",
                color: "white",
              }}
            >
              <TrophyOutlined
                style={{ fontSize: 48, color: "white", marginBottom: 16 }}
              />
              <Title level={3} style={{ color: "white" }}>
                Thành viên thường
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)" }}>
                100+ điểm tích lũy
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Paragraph style={{ color: "white" }}>
                <CheckCircleOutlined /> Giảm 5% cho mọi đơn hàng
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <GiftOutlined /> Quà tặng hàng tháng
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <StarOutlined /> Ưu tiên khách hàng
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Button
                type="primary"
                style={{
                  background: "white",
                  color: "#FB8C00",
                  border: "none",
                  borderRadius: 8,
                  height: 45,
                  fontWeight: 600,
                }}
                block
              >
                Đạt được ngay
              </Button>
            </Card>
          </Col>

          {/* VIP */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: 16,
                border: "none",
                boxShadow: "0 8px 24px rgba(76,175,80,0.2)",
                background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                color: "white",
              }}
            >
              <TrophyOutlined
                style={{ fontSize: 48, color: "white", marginBottom: 16 }}
              />
              <Title level={3} style={{ color: "white" }}>
                Thành viên VIP
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)" }}>
                500+ điểm tích lũy
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Paragraph style={{ color: "white" }}>
                <CheckCircleOutlined /> Giảm 15% cho mọi đơn hàng
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <GiftOutlined /> Quà tặng độc quyền hàng quý
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <StarOutlined /> Hỗ trợ khách hàng ưu tiên
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Button
                type="primary"
                style={{
                  background: "white",
                  color: "#388E3C",
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

          {/* DIAMOND */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: 16,
                border: "none",
                boxShadow: "0 8px 24px rgba(33,150,243,0.2)",
                background: "linear-gradient(135deg, #2196F3 0%, #1565C0 100%)",
                color: "white",
              }}
            >
              <CrownOutlined
                style={{ fontSize: 48, color: "#FFD700", marginBottom: 16 }}
              />
              <Title level={3} style={{ color: "white" }}>
                Thành viên Diamond
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)" }}>
                2000+ điểm tích lũy
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Paragraph style={{ color: "white" }}>
                <CheckCircleOutlined /> Giảm 25% cho mọi đơn hàng
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <GiftOutlined /> Quà tặng sinh nhật đặc biệt
              </Paragraph>
              <Paragraph style={{ color: "white" }}>
                <RocketOutlined /> Hỗ trợ riêng 24/7
              </Paragraph>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <Button
                type="primary"
                style={{
                  background: "#FFD700",
                  color: "#1565C0",
                  border: "none",
                  borderRadius: 8,
                  height: 45,
                  fontWeight: 600,
                }}
                block
              >
                Trở thành Diamond
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
                <GiftOutlined
                  style={{ fontSize: 48, color: "#C92127", marginBottom: 16 }}
                />
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
                <HeartOutlined
                  style={{ fontSize: 48, color: "#FF6B35", marginBottom: 16 }}
                />
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
                <RocketOutlined
                  style={{ fontSize: 48, color: "#F77F00", marginBottom: 16 }}
                />
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
