import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  List,
  Typography,
  Divider,
  Space,
  Button,
  Spin,
  Tag,
  Image,
  Modal,
  message,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { fetchOrderById, cancelOrder } from "../../services/orderService";
import { useAppDispatch } from "../../store/hooks";
import {
  getAllOrders,
  getOrdersByStatus,
} from "../../features/orders/ordersSlice";
import { addOrUpdateCartItem, fetchCart } from "../../features/cart/cartSlice";
import type {
  OrderDataType,
  OrderDetail,
  OrderHistory,
} from "../../types/Order";

const { Title, Text } = Typography;

const currency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v
  );

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN");
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "PENDING":
      return { text: "Chờ xác nhận", color: "orange" };
    case "PROCESSING":
      return { text: "Chờ lấy hàng", color: "blue" };
    case "SHIPPING":
      return { text: "Đang giao", color: "cyan" };
    case "COMPLETED":
      return { text: "Đã nhận", color: "green" };
    case "CANCELLED":
      return { text: "Đã hủy", color: "red" };
    default:
      return { text: status, color: "default" };
  }
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<OrderDataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    fetchOrderById(orderId)
      .then((data) => {
        setOrder(data as OrderDataType);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || "Lỗi khi tải chi tiết đơn hàng");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCancelOrder = () => {
    console.log("🔵 handleCancelOrder called", { orderId, order });
    if (!orderId || !order) {
      console.log("❌ Missing orderId or order");
      return;
    }
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderId) return;

    console.log("🟢 User confirmed, starting cancel...");
    setCancelLoading(true);
    try {
      console.log("📡 Calling cancelOrder API...");
      const response = await cancelOrder(orderId);
      console.log("✅ Cancel success:", response);
      message.success(response.message || "Đã hủy đơn hàng thành công!");

      // Đợi một chút để backend cập nhật database
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reload order data để cập nhật status
      console.log("🔄 Reloading order data...");
      const updatedOrder = await fetchOrderById(orderId);
      setOrder(updatedOrder as OrderDataType);

      // Reload TẤT CẢ các danh sách để đảm bảo đồng bộ
      console.log("🔄 Reloading all order lists...");

      // Reload PENDING list - đơn hàng sẽ biến mất
      await dispatch(
        getOrdersByStatus({ status: "PENDING", page: 1, limit: 20 })
      ).unwrap();

      // Reload CANCELLED list - đơn hàng sẽ xuất hiện
      await dispatch(
        getOrdersByStatus({ status: "CANCELLED", page: 1, limit: 20 })
      ).unwrap();

      // Reload ALL list
      await dispatch(getAllOrders({ page: 1, limit: 20 })).unwrap();

      console.log("✅ All done!");

      setShowCancelModal(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể hủy đơn hàng";
      console.error("❌ Error canceling order:", err);
      message.error(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReorder = () => {
    if (!order) return;
    setShowReorderModal(true);
  };
  const handleConfirmReorder = async () => {
    if (!order) return;

    setReorderLoading(true);
    try {
      console.log("🛒 Adding items to cart...");

      // Thêm từng sản phẩm vào giỏ hàng
      for (const detail of order.orderDetails) {
        if (detail.book?.bookId) {
          await dispatch(
            addOrUpdateCartItem({
              bookId: detail.book.bookId,
              quantity: detail.quantity,
            })
          ).unwrap();
        }
      }

      // Refresh cart
      await dispatch(fetchCart()).unwrap();

      message.success("Đã thêm sản phẩm vào giỏ hàng!");
      setShowReorderModal(false);

      // Chuyển đến trang checkout sau 500ms
      setTimeout(() => {
        navigate("/checkout");
      }, 500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể thêm sản phẩm vào giỏ hàng";
      console.error("❌ Error adding to cart:", err);
      message.error(errorMessage);
    } finally {
      setReorderLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ maxWidth: 900, margin: "0 auto" }}>
        <Title level={4}>Lỗi</Title>
        <Text type="danger">{error}</Text>
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card style={{ maxWidth: 900, margin: "0 auto" }}>
        <Title level={4}>Không tìm thấy đơn hàng</Title>
        <Text>Không tìm thấy đơn hàng với mã {orderId}</Text>
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "20px auto",
        padding: "20px",
        background: "linear-gradient(135deg, #fff5f5 0%, #ffe7e7 100%)",
        borderRadius: 12,
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(212, 56, 13, 0.15)",
          border: "2px solid #ff7875",
          background: "linear-gradient(135deg, #fff 0%, #fff1f0 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
            margin: "-24px -24px -24px -24px",
            padding: "20px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={0}>
                <Title
                  level={3}
                  style={{ margin: 0, color: "#ffffff", fontWeight: 700 }}
                >
                  🛍️ Chi tiết đơn hàng {order.orderId}
                </Title>
                <Text style={{ color: "#ffffffd9", fontSize: 14 }}>
                  📅 Ngày đặt: {formatDate(order.orderDate)}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space size={12}>
                <Tag
                  color={getStatusInfo(order.status).color}
                  style={{
                    fontSize: 14,
                    padding: "4px 12px",
                    fontWeight: 600,
                    borderRadius: 6,
                  }}
                >
                  {getStatusInfo(order.status).text}
                </Tag>

                {/* Nút Hủy đơn hàng - chỉ hiện với PENDING */}
                {order.status === "PENDING" && (
                  <Button
                    danger
                    loading={cancelLoading}
                    style={{
                      backgroundColor: "#fff",
                      borderColor: "#ff4d4f",
                      color: "#ff4d4f",
                      fontWeight: 600,
                      borderRadius: 6,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    onClick={handleCancelOrder}
                  >
                    ❌ Hủy đơn hàng
                  </Button>
                )}

                {/* Nút Mua lại - chỉ hiện với COMPLETED hoặc CANCELLED */}
                {(order.status === "COMPLETED" ||
                  order.status === "CANCELLED") && (
                  <Button
                    type="primary"
                    loading={reorderLoading}
                    style={{
                      backgroundColor: "#1890ff",
                      borderColor: "#1890ff",
                      fontWeight: 600,
                      borderRadius: 6,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    onClick={handleReorder}
                  >
                    🔄 Mua lại
                  </Button>
                )}

                <Button
                  style={{
                    backgroundColor: "#ffffff",
                    borderColor: "#ffffff",
                    color: "#ff4d4f",
                    fontWeight: 600,
                    borderRadius: 6,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  onClick={() => navigate(-1)}
                >
                  ← Quay lại
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ff4d4f 0%, #d4380d 100%)",
                  margin: 0,
                  padding: "16px 24px",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(212, 56, 13, 0.2)",
                }}
              >
                📦 Sản phẩm đã đặt
              </div>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(212, 56, 13, 0.12)",
              border: "2px solid #ffadd2",
              overflow: "hidden",
              background: "#ffffff",
            }}
            bodyStyle={{ padding: 0 }}
            headStyle={{
              padding: 0,
              border: "none",
              borderRadius: "12px 12px 0 0",
              overflow: "hidden",
              minHeight: 0,
              background: "transparent",
            }}
          >
            <div
              style={{
                maxHeight: 500,
                overflowY: "auto",
                padding: "16px 24px",
                background:
                  "linear-gradient(to bottom, #ffffff 0%, #fff5f5 100%)",
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={order.orderDetails || []}
                renderItem={(detail: OrderDetail, index) => (
                  <>
                    <List.Item
                      style={{
                        padding: "20px 16px",
                        background: index % 2 === 0 ? "#ffffff" : "#fffbf5",
                        borderRadius: 8,
                        marginBottom: 8,
                        border: "1px solid #ffe7e7",
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Image
                            width={90}
                            height={90}
                            src={detail.book?.coverImage}
                            alt={detail.book?.title}
                            fallback="https://via.placeholder.com/90"
                            style={{
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "2px solid #ffadd2",
                              boxShadow: "0 2px 8px rgba(212, 56, 13, 0.15)",
                            }}
                          />
                        }
                        title={
                          <Text
                            strong
                            style={{
                              fontSize: 16,
                              color: "#cf1322",
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            📚 {detail.book?.title}
                          </Text>
                        }
                        description={
                          <div style={{ marginTop: 8 }}>
                            {detail.book?.author && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 6,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#ff4d4f",
                                    fontWeight: 600,
                                    fontSize: 13,
                                  }}
                                >
                                  ✍️ Tác giả:
                                </Text>
                                <Text
                                  style={{ color: "#722ed1", fontSize: 13 }}
                                >
                                  {detail.book.author}
                                </Text>
                              </div>
                            )}
                            {detail.book?.publisher && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 6,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#ff4d4f",
                                    fontWeight: 600,
                                    fontSize: 13,
                                  }}
                                >
                                  🏢 NXB:
                                </Text>
                                <Text
                                  style={{ color: "#722ed1", fontSize: 13 }}
                                >
                                  {detail.book.publisher}
                                </Text>
                              </div>
                            )}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 8,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#ff4d4f",
                                  fontWeight: 600,
                                  fontSize: 13,
                                }}
                              >
                                💰 Đơn giá:
                              </Text>
                              <Text style={{ color: "#722ed1", fontSize: 13 }}>
                                {currency(detail.unitPrice)}
                              </Text>
                            </div>
                            <Tag
                              color="volcano"
                              style={{
                                fontWeight: 700,
                                fontSize: 14,
                                padding: "4px 12px",
                                borderRadius: 6,
                              }}
                            >
                              ✕ {detail.quantity}
                            </Tag>
                          </div>
                        }
                      />

                      <div
                        style={{
                          textAlign: "right",
                          minWidth: 130,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "flex-end",
                          padding: "0 8px",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#8c8c8c",
                            marginBottom: 4,
                          }}
                        >
                          Thành tiền
                        </Text>
                        <Text
                          style={{
                            color: "#ff4d4f",
                            fontSize: 18,
                            fontWeight: 700,
                          }}
                        >
                          {currency(detail.totalPrice)}
                        </Text>
                      </div>
                    </List.Item>
                    {index < (order.orderDetails?.length || 0) - 1 && (
                      <Divider
                        style={{ margin: "0", borderColor: "transparent" }}
                      />
                    )}
                  </>
                )}
              />
            </div>
            {(order.orderDetails?.length || 0) > 1 && (
              <Divider
                style={{
                  margin: "0 24px 16px 24px",
                  borderColor: "#ff7875",
                  borderWidth: 2,
                }}
              />
            )}
            <div
              style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)",
                borderTop: "2px solid #ff7875",
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: "#cf1322",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    📊 Tổng số lượng:{" "}
                    <Tag
                      color="volcano"
                      style={{ fontSize: 15, fontWeight: 700 }}
                    >
                      {order.orderDetails?.reduce(
                        (sum, d) => sum + d.quantity,
                        0
                      ) || 0}{" "}
                      sản phẩm
                    </Tag>
                  </Text>
                </Col>
                <Col>
                  <div style={{ textAlign: "right" }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#8c8c8c",
                        display: "block",
                      }}
                    >
                      Tổng thanh toán
                    </Text>
                    <Text
                      strong
                      style={{
                        fontSize: 20,
                        color: "#ff4d4f",
                        fontWeight: 700,
                      }}
                    >
                      {currency(order.totalAmount)}
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          <Card
            style={{
              marginTop: 20,
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(212, 56, 13, 0.12)",
              border: "2px solid #ffadd2",
              overflow: "hidden",
              background: "#ffffff",
            }}
            title={
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ff4d4f 0%, #d4380d 100%)",
                  margin: 0,
                  padding: "16px 24px",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(212, 56, 13, 0.2)",
                }}
              >
                📜 Lịch sử trạng thái
              </div>
            }
            bodyStyle={{ padding: 0 }}
            headStyle={{
              padding: 0,
              border: "none",
              borderRadius: "12px 12px 0 0",
              overflow: "hidden",
              minHeight: 0,
              background: "transparent",
            }}
          >
            <div
              style={{
                maxHeight: 350,
                overflowY: "auto",
                padding: "16px 24px",
                background:
                  "linear-gradient(to bottom, #ffffff 0%, #fff5f5 100%)",
              }}
            >
              <List
                dataSource={order.orderHistories || []}
                renderItem={(h: OrderHistory, index) => (
                  <List.Item
                    style={{
                      padding: "16px",
                      background: index % 2 === 0 ? "#ffffff" : "#fffbf5",
                      borderRadius: 8,
                      marginBottom: 12,
                      border: "1px solid #ffe7e7",
                      boxShadow: "0 2px 4px rgba(212, 56, 13, 0.05)",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: 18,
                            fontWeight: 700,
                            boxShadow: "0 2px 8px rgba(212, 56, 13, 0.3)",
                          }}
                        >
                          {index + 1}
                        </div>
                      }
                      title={
                        <Tag
                          color={getStatusInfo(h.status).color}
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            padding: "4px 14px",
                            borderRadius: 6,
                            border: "none",
                          }}
                        >
                          {getStatusInfo(h.status).text}
                        </Tag>
                      }
                      description={
                        <Text
                          style={{
                            color: "#722ed1",
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          🕐 {formatDate(h.timestamp)}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(212, 56, 13, 0.12)",
              border: "2px solid #ffadd2",
              overflow: "hidden",
              background: "#ffffff",
            }}
            title={
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ff4d4f 0%, #d4380d 100%)",
                  margin: 0,
                  padding: "16px 24px",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(212, 56, 13, 0.2)",
                }}
              >
                🚚 Thông tin giao hàng
              </div>
            }
            bodyStyle={{ padding: "20px" }}
            headStyle={{
              padding: 0,
              border: "none",
              borderRadius: "12px 12px 0 0",
              overflow: "hidden",
              minHeight: 0,
              background: "transparent",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)",
                padding: "16px",
                borderRadius: 8,
                border: "1px solid #ffe7e7",
              }}
            >
              <div
                style={{
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: "2px dashed #ffadd2",
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#cf1322",
                    fontWeight: 700,
                  }}
                >
                  👤 {order.customer?.fullName}
                </Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Space
                  style={{
                    background: "#fff",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #ffe7e7",
                    width: "100%",
                  }}
                >
                  <PhoneOutlined
                    style={{
                      color: "#ff4d4f",
                      fontSize: 16,
                    }}
                  />
                  <Text
                    style={{
                      color: "#722ed1",
                      fontWeight: 500,
                    }}
                  >
                    {order.customer?.phoneNumber}
                  </Text>
                </Space>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Space
                  style={{
                    background: "#fff",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #ffe7e7",
                    width: "100%",
                  }}
                >
                  <MailOutlined
                    style={{
                      color: "#ff4d4f",
                      fontSize: 16,
                    }}
                  />
                  <Text
                    style={{
                      color: "#722ed1",
                      fontWeight: 500,
                      wordBreak: "break-all",
                    }}
                  >
                    {order.customer?.email}
                  </Text>
                </Space>
              </div>
              <Divider
                style={{
                  margin: "16px 0",
                  borderColor: "#ffadd2",
                  borderWidth: 1,
                }}
              />
              <div
                style={{
                  background: "#fff",
                  padding: "12px",
                  borderRadius: 6,
                  border: "1px solid #ffe7e7",
                }}
              >
                <Space
                  style={{
                    marginBottom: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <EnvironmentOutlined
                    style={{
                      color: "#ff4d4f",
                      fontSize: 16,
                      marginTop: 2,
                    }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#cf1322",
                      fontSize: 14,
                    }}
                  >
                    Địa chỉ giao hàng:
                  </Text>
                </Space>
                <Text
                  style={{
                    lineHeight: 1.6,
                    marginLeft: 24,
                    color: "#722ed1",
                    display: "block",
                    fontWeight: 500,
                  }}
                >
                  {order.customer?.address}
                </Text>
              </div>
            </div>
          </Card>

          <Card
            style={{
              marginTop: 16,
              borderRadius: 12,
              boxShadow: "0 6px 20px rgba(212, 56, 13, 0.2)",
              border: "3px solid #ff4d4f",
              overflow: "hidden",
              background: "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
            }}
            title={
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)",
                  margin: 0,
                  padding: "16px 24px",
                  color: "#cf1322",
                  fontWeight: 700,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderBottom: "2px solid #ff7875",
                }}
              >
                💰 Tổng tiền thanh toán
              </div>
            }
            bodyStyle={{ padding: "32px 24px" }}
            headStyle={{
              padding: 0,
              border: "none",
              borderRadius: "12px 12px 0 0",
              overflow: "hidden",
              minHeight: 0,
              background: "transparent",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  padding: "24px",
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#8c8c8c",
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Tổng giá trị đơn hàng
                </Text>
                <Title
                  level={2}
                  style={{
                    color: "#ff4d4f",
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 800,
                    textShadow: "2px 2px 4px rgba(212, 56, 13, 0.2)",
                  }}
                >
                  {currency(order.totalAmount)}
                </Title>
                <Divider
                  style={{
                    margin: "16px 0",
                    borderColor: "#ffadd2",
                  }}
                />
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid #ffe7e7",
                  }}
                >
                  <Text
                    style={{
                      color: "#722ed1",
                      fontSize: 14,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    💳 Phương thức:
                    <Tag
                      color="volcano"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "4px 12px",
                      }}
                    >
                      {order.payments?.[0]?.method || "COD"}
                    </Tag>
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal xác nhận hủy đơn hàng */}
      <Modal
        title="Xác nhận hủy đơn hàng"
        open={showCancelModal}
        onOk={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
        okText="Hủy đơn hàng"
        cancelText="Đóng"
        okButtonProps={{ danger: true, loading: cancelLoading }}
        confirmLoading={cancelLoading}
      >
        <div style={{ padding: "20px 0" }}>
          <p style={{ fontSize: 15, marginBottom: 12 }}>
            <ExclamationCircleOutlined
              style={{ color: "#ff4d4f", marginRight: 8, fontSize: 18 }}
            />
            Bạn có chắc chắn muốn hủy đơn hàng{" "}
            <strong style={{ color: "#ff4d4f" }}>{orderId}</strong> không?
          </p>
          <p style={{ color: "#8c8c8c", fontSize: 13, marginBottom: 0 }}>
            Lưu ý: Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"
          </p>
        </div>
      </Modal>

      {/* Modal xác nhận mua lại */}
      <Modal
        title="Xác nhận mua lại"
        open={showReorderModal}
        onOk={handleConfirmReorder}
        onCancel={() => setShowReorderModal(false)}
        okText="Mua lại"
        cancelText="Hủy"
        okButtonProps={{ type: "primary", loading: reorderLoading }}
        confirmLoading={reorderLoading}
      >
        <div style={{ padding: "20px 0" }}>
          <p style={{ fontSize: 15, marginBottom: 12 }}>
            <ExclamationCircleOutlined
              style={{ color: "#1890ff", marginRight: 8, fontSize: 18 }}
            />
            Bạn có chắc chắn muốn mua lại đơn hàng{" "}
            <strong style={{ color: "#1890ff" }}>{orderId}</strong> không?
          </p>
          <p style={{ color: "#8c8c8c", fontSize: 13, marginBottom: 0 }}>
            Các sản phẩm sẽ được thêm vào giỏ hàng và bạn có thể kiểm tra lại
            thông tin trước khi đặt hàng.
          </p>
        </div>
      </Modal>
    </div>
  );
}
