/**
 * Generic Order List Component with Status Filtering
 * Reusable component for all order status pages (PENDING, PROCESSING, SHIPPING, COMPLETED, CANCELLED)
 */
import React, { useEffect } from "react";
import { Spin, Empty, Card } from "antd";
import OrderList from "./OrderList";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getOrdersByStatus } from "../features/orders/ordersSlice";
import type { RootState } from "../store/index";

interface OrderStatusPageProps {
  status: "PENDING" | "PROCESSING" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  emptyText?: string;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({
  status,
  emptyText = "Không có đơn hàng",
}) => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector(
    (state: RootState) => state.orders as any
  );

  useEffect(() => {
    dispatch(getOrdersByStatus({ status, page: 1, limit: 20 }));
  }, [status, dispatch]);

  return (
    <div>
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
          description={emptyText}
          style={{ marginTop: "50px", marginBottom: "50px" }}
        />
      )}

      {/* Order list */}
      {!loading && orders.length > 0 && <OrderList orders={orders} />}
    </div>
  );
};

export default OrderStatusPage;
