import { Button, Card, Typography, Space } from "antd";
import { LockOutlined, HomeOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Title, Text } = Typography;

export default function LoginRequiredPage() {
  const navigate = useNavigate();

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
        {/* Header */}
        <div
          style={{
            background: "rgb(207, 38, 45)",
            padding: "32px 24px",
            textAlign: "center",
            color: "white",
          }}
        >
          <LockOutlined style={{ fontSize: 56, marginBottom: 16 }} />
          <Title level={2} style={{ color: "white", margin: "16px 0 8px" }}>
            Yêu cầu đăng nhập
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
            Vui lòng đăng nhập để vào xem
          </Text>
        </div>

        {/* Nội dung */}
        <div style={{ padding: "32px 24px", background: "#fff" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div
              style={{
                background: "#fffbf0",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #ffc069",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: "#d46b08",
                  fontSize: 15,
                  display: "block",
                }}
              >
                ⚠️ Tính năng này chỉ dành cho những khách hàng đã đăng nhập. Vui
                lòng đăng nhập để tiếp tục.
              </Text>
            </div>

            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text
                strong
                style={{
                  color: "#333",
                  fontSize: 14,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Bạn chưa có tài khoản?
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: 13,
                  display: "block",
                }}
              >
                Hãy đăng ký một tài khoản mới để bắt đầu mua sắm với chúng tôi.
              </Text>
            </Space>

            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
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
                Đăng nhập / Đăng ký
              </Button>

              <Button
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate("/")}
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
                Về trang chủ
              </Button>
            </Space>
          </Space>
        </div>
      </Card>
    </div>
  );
}
