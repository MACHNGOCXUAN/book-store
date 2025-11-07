// OrderSuccessPage.tsx
import { Button, Card, Typography, Space, Divider } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../store/hooks";
import { fetchCart } from "../features/cart/cartSlice";

const { Title, Text } = Typography;

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const order = state?.order;
  const payment = state?.payment;
  const paymentMethod = state?.paymentMethod;
  const [qrExpired, setQrExpired] = useState(false);

  // Hiệu ứng cuộn lên đầu trang và reload cart
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Reload cart to update the cart icon count in header
    dispatch(fetchCart());

    // Show success toast
    toast.success("Đặt hàng thành công!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, [dispatch]);

  // Kiểm tra hạn QR code
  useEffect(() => {
    if (payment?.expiresAt) {
      const timeLeft = payment.expiresAt - Date.now();
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setQrExpired(true);
        }, timeLeft);
        return () => clearTimeout(timer);
      } else {
        setQrExpired(true);
      }
    }
  }, [payment]);

  const handleCopyPaymentUrl = () => {
    if (payment?.paymentUrl) {
      navigator.clipboard.writeText(payment.paymentUrl);
      toast.success("Đã sao chép link thanh toán!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

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
          maxWidth:
            paymentMethod === "VNPAY" || (paymentMethod === "MOMO" && payment)
              ? 600
              : 520,
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

            {/* QR Code Section cho ONLINE payment */}
            {(paymentMethod === "VNPAY" || paymentMethod === "MOMO") &&
              payment?.qrCodeBase64 && (
                <>
                  <Divider style={{ margin: "20px 0", borderColor: "#eee" }} />
                  <div
                    style={{
                      background: "#fffbf0",
                      padding: 20,
                      borderRadius: 12,
                      border: "1px solid #ffc069",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: "#d46b08",
                        fontSize: 14,
                        display: "block",
                        marginBottom: 16,
                      }}
                    >
                      📱 Thông tin thanh toán
                    </Text>
                    {!qrExpired && (
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              background: "white",
                              padding: 12,
                              borderRadius: 8,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            <img
                              src={payment.qrCodeBase64}
                              alt="QR Code"
                              style={{
                                maxWidth: 220,
                                width: "100%",
                                height: "auto",
                                borderRadius: 6,
                              }}
                            />
                          </div>
                        </div>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            display: "block",
                            textAlign: "center",
                          }}
                        >
                          Quét mã QR để thanh toán
                        </Text>
                      </div>
                    )}
                    {qrExpired && (
                      <Text
                        type="danger"
                        style={{ display: "block", marginBottom: 12 }}
                      >
                        ⏰ Mã QR đã hết hạn. Vui lòng tạo lại đơn hàng nếu chưa
                        thanh toán.
                      </Text>
                    )}
                    <div
                      style={{
                        marginBottom: 12,
                        padding: 14,
                        background: "white",
                        borderRadius: 8,
                        textAlign: "center",
                        border: "2px solid #ffc069",
                      }}
                    >
                      <Text strong style={{ color: "#d32f2f", fontSize: 18 }}>
                        {payment.amount?.toLocaleString("vi-VN")} ₫
                      </Text>
                    </div>
                    {!qrExpired && (
                      <>
                        <Divider style={{ margin: "8px 0" }} />
                        <Button
                          size="small"
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={handleCopyPaymentUrl}
                          style={{ width: "100%", color: "#d46b08" }}
                        >
                          Sao chép link thanh toán
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}

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
