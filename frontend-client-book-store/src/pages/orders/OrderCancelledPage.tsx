import OrderStatusPage from "../../components/OrderStatusPage";

const OrderCancelledPage = () => {
  return (
    <OrderStatusPage status="CANCELLED" emptyText="Không có đơn hàng đã hủy" />
  );
};

export default OrderCancelledPage;
