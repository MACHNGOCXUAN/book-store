import OrderStatusPage from "../../components/OrderStatusPage";

const OrderPendingPage = () => {
  return (
    <OrderStatusPage
      status="PENDING"
      emptyText="Không có đơn hàng chờ xác nhận"
    />
  );
};

export default OrderPendingPage;
