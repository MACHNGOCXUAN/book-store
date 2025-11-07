import OrderStatusPage from "../../components/OrderStatusPage";

const OrderProcessingPage = () => {
  return (
    <OrderStatusPage
      status="PROCESSING"
      emptyText="Không có đơn hàng chờ lấy hàng"
    />
  );
};

export default OrderProcessingPage;
