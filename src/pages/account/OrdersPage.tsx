import { useState, useEffect } from "react";
import { Row, Col, Typography, Space, Card, Badge } from "antd";
import {
  WalletOutlined,
  DropboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RightOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAllOrders } from "../../features/orders/ordersSlice";

const { Text, Title } = Typography;

export const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook lấy URL hiện tại
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.orders);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    dispatch(getAllOrders({ page: 1, limit: 100 }));
  }, [dispatch]);

  const orderStatusItems = [
    {
      key: "PENDING",
      label: "Chờ xác nhận",
      icon: <WalletOutlined />,
      path: "/account/orders/pending",
    },
    {
      key: "PROCESSING",
      label: "Chờ lấy hàng",
      icon: <DropboxOutlined />,
      path: "/account/orders/processing",
    },
    {
      key: "SHIPPING",
      label: "Đang giao",
      icon: <TruckOutlined />,
      path: "/account/orders/shipping",
    },
    {
      key: "COMPLETED",
      label: "Đã nhận",
      icon: <CheckCircleOutlined />,
      path: "/account/orders/completed",
    },
    {
      key: "CANCELLED",
      label: "Đã hủy",
      icon: <CloseCircleOutlined />,
      path: "/account/orders/cancelled",
    },
  ];

  const getCountByStatus = (status) => {
    return Array.isArray(orders)
      ? orders.filter((order) => order?.status === status).length
      : 0;
  };

  const primaryColor = "#1890ff";
  const normalColor = "#595959";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header Section */}
      <Card
        bordered={false}
        bodyStyle={{ padding: "20px 24px" }}
        style={{
          marginBottom: "20px",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Top Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "24px" }}
        >
          <Col>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Đơn mua của tôi
            </Title>
          </Col>
          <Col>
            <Space
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/account/orders")}
            >
              <Text type="secondary">Xem lịch sử mua hàng</Text>
              <RightOutlined style={{ fontSize: "12px", color: "#8c8c8c" }} />
            </Space>
          </Col>
        </Row>

        {/* Status Icons Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {orderStatusItems.map((item) => {
            // Kiểm tra xem URL hiện tại có trùng với path của item không
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.key;

            // Active hoặc Hover thì đều đổi màu
            const currentColor =
              isActive || isHovered ? primaryColor : normalColor;

            const count = getCountByStatus(item.key);

            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  flex: 1,
                  transition: "all 0.3s",
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.key)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Badge
                  count={count}
                  offset={[0, 5]}
                  style={{ backgroundColor: "#ff4d4f", boxShadow: "none" }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                      color: currentColor, // Sử dụng màu đã tính toán
                      marginBottom: "8px",
                      padding: "10px",
                      borderRadius: "50%",
                      // Nếu đang active hoặc hover thì hiện nền xanh nhạt
                      backgroundColor:
                        isActive || isHovered ? "#e6f7ff" : "transparent",
                      transition: "all 0.3s",
                    }}
                  >
                    {item.icon}
                  </div>
                </Badge>

                <Text
                  style={{
                    fontSize: "14px",
                    color: currentColor, // Sử dụng màu đã tính toán cho text luôn
                    fontWeight: isActive ? 500 : 400, // In đậm nhẹ khi active
                    transition: "color 0.3s",
                  }}
                >
                  {item.label}
                </Text>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Content Area */}
      <div style={{ marginTop: 20 }}>
        <Outlet />
      </div>
    </div>
  );
};
