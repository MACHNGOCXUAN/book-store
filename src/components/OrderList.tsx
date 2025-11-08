import React, { useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  List,
  Space,
  Divider,
  Image,
  Row,
  Col,
  Modal,
  message,
  App,
} from "antd";
import {
  CarOutlined,
  ShopOutlined,
  DollarOutlined,
  TruckOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { cancelOrder } from "../services/orderService";

const { Text, Title } = Typography;

// Định nghĩa kiểu dữ liệu cho props (nếu bạn dùng TypeScript chặt chẽ)
interface OrderListProps {
  orders: any[]; // Thay any bằng interface Order thực tế của bạn nếu có
  onOrderUpdated?: () => void; // Callback để refresh danh sách sau khi hủy
}

const OrderList: React.FC<OrderListProps> = ({ orders, onOrderUpdated }) => {
  const navigate = useNavigate();
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const { modal } = App.useApp();

  const getStatusTagColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "SHIPPING":
        return "cyan";
      case "PROCESSING":
        return "processing";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "PROCESSING":
        return "Chờ lấy hàng";
      case "SHIPPING":
        return "Đang giao hàng";
      case "COMPLETED":
        return "Đã nhận";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    console.log("🔵 handleCancelOrder called with orderId:", orderId);

    try {
      // Sử dụng modal instance từ App.useApp()
      modal.confirm({
        title: "Xác nhận hủy đơn hàng",
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>
              Bạn có chắc chắn muốn hủy đơn hàng <strong>{orderId}</strong>{" "}
              không?
            </p>
            <p style={{ color: "#ff4d4f", fontSize: 13 }}>
              Lưu ý: Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"
            </p>
          </div>
        ),
        okText: "Hủy đơn hàng",
        okType: "danger",
        cancelText: "Không",
        onOk: async () => {
          console.log("🟢 User confirmed cancel order:", orderId);
          setCancelLoading(orderId);
          try {
            console.log("🟡 Calling cancelOrder API...");
            const response = await cancelOrder(orderId);
            console.log("✅ Cancel order success:", response);
            message.success(response.message || "Đã hủy đơn hàng thành công!");

            // Gọi callback để refresh danh sách
            if (onOrderUpdated) {
              console.log("🔄 Refreshing order list...");
              onOrderUpdated();
            }
          } catch (err: any) {
            const errorMessage =
              err instanceof Error ? err.message : "Không thể hủy đơn hàng";
            console.error("❌ Error canceling order:", err);
            message.error(errorMessage);
          } finally {
            setCancelLoading(null);
          }
        },
      });

      console.log("📌 Modal.confirm called");
    } catch (error) {
      console.error("❌ Error creating modal:", error);
    }
  };

  if (orders.length === 0) {
    return (
      <Card
        bordered={false}
        style={{
          textAlign: "center",
          borderRadius: 8,
          padding: "40px 0",
          background: "transparent",
          boxShadow: "none",
        }}
      >
        <Image
          width={200}
          preview={false}
          src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/5fafbb923393b712b96488590b8f781f.png"
          fallback="https://via.placeholder.com/200x200?text=No+Orders"
        />
        <Title level={5} style={{ marginTop: 20, color: "#888" }}>
          Chưa có đơn hàng
        </Title>
      </Card>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {orders.map((order) => (
        <Card
          key={order.orderId}
          style={{
            marginBottom: 16,
            borderRadius: 8,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
          bodyStyle={{ padding: "16px 24px" }}
          bordered={false}
        >
          {/* Header đơn hàng */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 12 }}
          >
            <Col>
              <Space>
                <Text strong>
                  <ShopOutlined /> {order.shopName}
                </Text>
                <Button
                  size="small"
                  type="text"
                  onClick={() => navigate(`/chat/${order.shopName}`)}
                >
                  Chat
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                {order.status === "PROCESSING" && (
                  <CarOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                )}
                {order.status === "SHIPPING" && (
                  <TruckOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                )}
                <Tag
                  color={getStatusTagColor(order.status)}
                  style={{ marginRight: 0 }}
                >
                  {getStatusText(order.status)}
                </Tag>
              </Space>
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0" }} />

          {/* Danh sách sản phẩm */}
          <List
            itemLayout="horizontal"
            dataSource={order.orderDetails}
            renderItem={(detail: any) => (
              <List.Item style={{ borderBottom: "none", padding: "12px 0" }}>
                <List.Item.Meta
                  avatar={
                    <Image
                      width={80}
                      height={80}
                      src={detail.book?.coverImage}
                      fallback="https://via.placeholder.com/80"
                      preview={false}
                      style={{ borderRadius: 4, border: "1px solid #f0f0f0" }}
                    />
                  }
                  title={
                    <Text style={{ fontSize: 15 }}>{detail.book?.title}</Text>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      {detail.book?.author && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Tác giả: {detail.book.author}
                        </Text>
                      )}
                      <Text>x{detail.quantity}</Text>
                    </Space>
                  }
                />
                <div style={{ textAlign: "right" }}>
                  <Text style={{ color: "#ff4d4f", fontSize: 16 }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(detail.totalPrice)}
                  </Text>
                </div>
              </List.Item>
            )}
          />

          <Divider style={{ margin: "12px 0" }} />

          {/* Footer đơn hàng */}
          <div
            style={{
              backgroundColor: "#fffaf7",
              padding: "16px 24px",
              margin: "0 -24px -16px",
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          >
            <Row justify="end" align="middle" style={{ marginBottom: 16 }}>
              <Space size="large">
                <Text type="secondary">
                  <DollarOutlined /> Thành tiền:
                </Text>
                <Title level={4} style={{ color: "#ff4d4f", margin: 0 }}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.totalAmount)}
                </Title>
              </Space>
            </Row>
            <Row justify="end">
              <Space>
                {order.status === "COMPLETED" && (
                  <>
                    <Button>Đánh giá</Button>
                    <Button type="primary" danger>
                      Mua lại
                    </Button>
                  </>
                )}
                {order.status === "PENDING" && (
                  <Button
                    type="primary"
                    danger
                    loading={cancelLoading === order.orderId}
                    onClick={() => handleCancelOrder(order.orderId)}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
                {(order.status === "PROCESSING" ||
                  order.status === "SHIPPING") && (
                  <Button disabled>Đã nhận được hàng</Button>
                )}
                <Button>Liên hệ người bán</Button>
                <Button onClick={() => navigate(`/orders/${order.orderId}`)}>
                  Xem chi tiết
                </Button>
              </Space>
            </Row>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrderList;
