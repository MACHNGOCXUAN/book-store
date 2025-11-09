import OrderStatusPage from "../../components/OrderStatusPage";

const OrderCompletedPage = () => {
  return (
    <OrderStatusPage
      status="COMPLETED"
      emptyText="Không có đơn hàng đã hoàn thành"
    />
  );
};

export default OrderCompletedPage;
