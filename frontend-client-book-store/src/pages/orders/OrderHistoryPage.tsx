// src/pages/orders/OrderHistoryPage.tsx
import { useEffect, useState } from "react";
import { Tabs, Card, Spin, Empty, App } from "antd";
import { useSearchParams } from "react-router-dom";
import OrderList from "../../components/OrderList";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getAllOrders,
  getOrdersByStatus,
} from "../../features/orders/ordersSlice";

const OrderHistoryPage = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const items = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xác nhận" },
    { key: "PROCESSING", label: "Chờ lấy hàng" },
    { key: "SHIPPING", label: "Đang giao hàng" },
    { key: "COMPLETED", label: "Hoàn thành" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  // Sync tab từ URL params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && items.some((item) => item.key === statusParam)) {
      setActiveTab(statusParam);
    } else {
      setActiveTab("ALL");
    }
  }, [searchParams]);

  // Fetch orders khi tab thay đổi
  useEffect(() => {
    if (activeTab === "ALL") {
      dispatch(getAllOrders({ page: 1, limit: 20 }));
    } else {
      dispatch(getOrdersByStatus({ status: activeTab, page: 1, limit: 20 }));
    }
  }, [activeTab, dispatch]);

  const handleOrderUpdated = () => {
    // Refresh danh sách đơn hàng sau khi hủy
    if (activeTab === "ALL") {
      dispatch(getAllOrders({ page: 1, limit: 20 }));
    } else {
      dispatch(getOrdersByStatus({ status: activeTab, page: 1, limit: 20 }));
    }
  };

  const onChangeTab = (key: string) => {
    setActiveTab(key);
    setSearchParams(key === "ALL" ? {} : { status: key });
  };

  return (
    <App>
      <div style={{ background: "transparent", minHeight: "100vh" }}>
        <Card
          bordered={false}
          bodyStyle={{ padding: "0 20px" }}
          style={{
            borderRadius: 8,
            marginBottom: 20,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={onChangeTab}
            items={items}
            tabBarStyle={{ marginBottom: 0 }}
            size="large"
          />
        </Card>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <Spin size="large" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <Card style={{ borderColor: "#ff4d4f", marginBottom: 20 }}>
            <div style={{ color: "#ff4d4f" }}>
              <strong>Lỗi:</strong> {error}
            </div>
          </Card>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && !error && (
          <Empty
            description="Không có đơn hàng"
            style={{ marginTop: "50px", marginBottom: "50px" }}
          />
        )}

        {/* Order list */}
        {!loading && orders.length > 0 && (
          <OrderList orders={orders} onOrderUpdated={handleOrderUpdated} />
        )}
      </div>
    </App>
  );
};

export default OrderHistoryPage;
