// OrderSuccessPage.tsx
import { Button, Card, Typography, Space, Divider } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Title, Text } = Typography;

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const order = state?.order;

  // Hiệu ứng cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdfbfb 0%, #f4f4f9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          maxWidth: 520,
          width: "100%",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(207, 38, 45, 0.1)",
          border: "1px solid rgba(207, 38, 45, 0.15)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header màu đỏ chủ đạo */}
        <div
          style={{
            background: "rgb(207, 38, 45)",
            padding: "32px 24px",
            textAlign: "center",
            color: "white",
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 56, marginBottom: 16 }} />
          <Title level={2} style={{ color: "white", margin: "16px 0 8px" }}>
            Đặt hàng thành công!
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
            Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng của chúng tôi
          </Text>
        </div>

        {/* Nội dung chi tiết */}
        <div style={{ padding: "32px 24px", background: "#fff" }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ color: "#555", fontSize: 15 }}>
                Mã đơn hàng:
              </Text>
              <Title
                level={4}
                copyable
                style={{
                  margin: "4px 0 0",
                  color: "rgb(207, 38, 45)",
                  fontWeight: "bold",
                }}
              >
                {order?.orderId}
              </Title>
            </div>

            <Divider style={{ margin: "20px 0", borderColor: "#eee" }} />

            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate("/")}
                style={{
                  background: "rgb(207, 38, 45)",
                  borderColor: "rgb(207, 38, 45)",
                  borderRadius: 8,
                  fontWeight: 600,
                  padding: "0 24px",
                  height: 44,
                  boxShadow: "0 4px 12px rgba(207, 38, 45, 0.3)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(207, 38, 45, 0.4)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(207, 38, 45, 0.3)")
                }
              >
                Về trang chủ
              </Button>

              <Button
                size="large"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/orders/${order?.orderId}`)}
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  padding: "0 24px",
                  height: 44,
                  borderColor: "rgb(207, 38, 45)",
                  color: "rgb(207, 38, 45)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(207, 38, 45, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Xem chi tiết đơn
              </Button>
            </Space>

            <Text
              type="secondary"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 24,
                fontSize: 13,
              }}
            >
              Chúng tôi sẽ gửi email xác nhận trong vài phút tới.
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
}
