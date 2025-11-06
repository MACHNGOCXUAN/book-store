import OrderStatusPage from "../../components/OrderStatusPage";

const OrderShippingPage = () => {
  return (
    <OrderStatusPage
      status="SHIPPING"
      emptyText="Không có đơn hàng đang giao"
    />
  );
};

export default OrderShippingPage;
