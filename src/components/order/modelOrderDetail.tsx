import React, { useState } from "react";
import {
  Modal,
  Row,
  Col,
  Button,
  Image,
  Tag,
  Divider,
  Steps,
  Timeline,
  Select,
  message,
} from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  EditOutlined,
  BookOutlined,
  DollarOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { OrderDataType, OrderStatus } from "@/types/order.type";
import { HorizontalTimeline } from "../ui/TimeLine";

interface OrderDetailModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  order: OrderDataType | null;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderDetailModal = ({
  isModalOpen,
  setIsModalOpen,
  order,
  onUpdateStatus,
}: OrderDetailModalProps) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditingStatus(false);
    setNewStatus(null);
  };

  const statusConfig = {
    PENDING: {
      label: "Vừa tạo",
      color: "gold",
      icon: <ClockCircleOutlined />,
      step: 0,
    },
    PROCESSING: {
      label: "Đang xử lý",
      color: "blue",
      icon: <ShoppingOutlined />,
      step: 1,
    },
    SHIPPING: {
      label: "Đang giao",
      color: "blue",
      icon: <ShoppingOutlined />,
      step: 1,
    },
    COMPLETED: {
      label: "Đã giao",
      color: "green",
      icon: <CheckCircleOutlined />,
      step: 2,
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "red",
      icon: <CloseCircleOutlined />,
      step: -1,
    },
  };

  const getAvailableStatuses = (status: OrderStatus): OrderStatus[] => {
    switch (status) {
      case "PENDING":
        return ["PROCESSING", "CANCELLED"];
      case "PROCESSING":
        return ["COMPLETED", "CANCELLED"];
      default:
        return [];
    }
  };

  const handleUpdateStatus = () => {
    if (order && newStatus && onUpdateStatus) {
      onUpdateStatus(order.orderId, newStatus);
      setIsModalOpen(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const InfoItem = ({
    icon,
    label,
    value,
    highlight = false,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div
      className={`group relative ${
        highlight ? "bg-gradient-to-r from-blue-50 to-transparent" : "bg-white"
      } rounded-xl p-4! transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-blue-200`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`${
            highlight
              ? "bg-gradient-to-br from-blue-500 to-blue-600"
              : "bg-gray-100 group-hover:bg-blue-50"
          } w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0`}
        >
          <div
            className={`${
              highlight
                ? "text-white"
                : "text-gray-600 group-hover:text-blue-600"
            } text-lg transition-colors`}
          >
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5!">
            {label}
          </div>
          <div className="text-gray-900 font-medium text-base leading-snug">
            {value || (
              <span className="text-gray-400 italic">Chưa có thông tin</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const availableStatuses = order ? getAvailableStatuses(order.status) : [];

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      closeIcon={
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <CloseOutlined className="text-gray-600" />
        </div>
      }
      styles={{
        body: { padding: 0 },
        header: { display: "none" },
      }}
      className="premium-order-modal"
    >
      <style>{`
        .premium-order-modal .ant-modal-content {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>

      {order ? (
        <div className="relative">
          <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 px-8! py-6! relative overflow-hidden rounded-2xl">
            <div className="relative z-10 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">
                Chi tiết đơn hàng: {order.orderId}
              </h3>
            </div>
          </div>

          <div className="px-8! py-8! bg-gray-50 max-h-[70vh] overflow-y-auto">
            <Row gutter={[32, 32]}>
              <Col xs={24} lg={24}>
                <div className="bg-white rounded-2xl p-6! shadow-md mb-6!">
                  <div className="flex items-center justify-between mb-6!">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <TruckOutlined className="text-white text-lg" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Trạng thái đơn hàng
                      </h3>
                    </div>
                    {availableStatuses.length > 0 && !isEditingStatus && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setIsEditingStatus(true)}
                        className="rounded-lg"
                      >
                        Cập nhật
                      </Button>
                    )}
                  </div>

                  {isEditingStatus ? (
                    <div className="space-y-4!">
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Chọn trạng thái mới"
                        value={newStatus}
                        onChange={setNewStatus}
                        size="large"
                        options={availableStatuses.map((status) => ({
                          value: status,
                          label: statusConfig[status].label,
                        }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="primary"
                          onClick={handleUpdateStatus}
                          disabled={!newStatus}
                          className="flex-1"
                        >
                          Xác nhận
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingStatus(false);
                            setNewStatus(null);
                          }}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {order.status !== "CANCELLED" && (
                        <Steps
                          current={statusConfig[order.status].step}
                          className="mb-6!"
                          items={[
                            {
                              title: "Vừa tạo",
                              icon: <ClockCircleOutlined />,
                            },
                            {
                              title: "Đang xử lý",
                              icon: <ShoppingOutlined />,
                            },
                            {
                              title: "Đã giao",
                              icon: <CheckCircleOutlined />,
                            },
                          ]}
                        />
                      )}

                      <Divider />

                      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3!">
                        Lịch sử đơn hàng
                      </div>

                      {/* Timeline theo chiểu dọc sử dụng của antd */}
                      {/* <Timeline
                        items={order?.orderHistories?.map((h) => ({
                          color: statusConfig[h.status].color,
                          children: (
                            <div>
                              <div className="font-medium text-gray-900">
                                {statusConfig[h.status].label}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(h.timestamp)}
                              </div>
                            </div>
                          ),
                        }))}
                      /> */}

                      {/* custom time line */}
                      <HorizontalTimeline
                        items={order?.orderHistories?.map((h) => ({
                          color: statusConfig[h.status].color,
                          children: (
                            <div>
                              <div className="font-medium text-gray-900">
                                {statusConfig[h.status].label}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(h.timestamp)}
                              </div>
                            </div>
                          ),
                        }))}
                      />
                    </>
                  )}
                </div>
              </Col>
            </Row>

            <Row gutter={[23, 32]}>
              <Col xs={24} lg={24}>
                <div className="bg-white rounded-2xl p-6! shadow-md">
                  <div className="flex items-center gap-3 mb-6!">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <BookOutlined className="text-white text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Sản phẩm ({order.orderDetails.length})
                    </h3>
                  </div>

                  <div className="space-y-4!">
                    {order.orderDetails.map((item, index) => (
                      <div key={item.orderDetailId}>
                        <div className="flex gap-4">
                          <div className="w-20 h-28 flex-shrink-0">
                            <Image
                              src={item.book.coverImage}
                              alt={item.book.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                              preview={false}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                              {item.book.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              {item.book.author}
                            </p>
                            <Tag color="purple" className="mb-2">
                              {item.book.category}
                            </Tag>
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mt-2">
                              <div>
                                <span className="text-xs text-gray-500">
                                  Đơn giá:{" "}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">
                                  SL:{" "}
                                </span>
                                <span className="font-medium text-gray-900">
                                  x{item.quantity}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">
                                  Thành tiền:{" "}
                                </span>
                                <span className="font-bold text-blue-600">
                                  {formatCurrency(item.totalPrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < order.orderDetails.length - 1 && (
                          <Divider className="my-4!" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={[32, 32]} className="mt-10!">
              <Col xs={24} lg={14}>
                <div className="bg-white rounded-2xl p-6! shadow-md mb-6!">
                  <div className="flex items-center gap-3 mb-6!">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <UserOutlined className="text-white text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Thông tin khách hàng
                    </h3>
                  </div>

                  <div className="space-y-3!">
                    <InfoItem
                      icon={<UserOutlined />}
                      label="Họ và tên"
                      value={order.customer.fullName || "Chưa cập nhật"}
                      highlight={true}
                    />
                    <InfoItem
                      icon={<PhoneOutlined />}
                      label="Số điện thoại"
                      value={order.customer.phoneNumber}
                    />
                    <InfoItem
                      icon={<MailOutlined />}
                      label="Email"
                      value={order.customer.email}
                    />
                    <InfoItem
                      icon={<EnvironmentOutlined />}
                      label="Địa chỉ giao hàng"
                      value={order.customer.address || "Chưa cập nhật"}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={10}>
                <div className="bg-white rounded-2xl p-6! shadow-md mb-6!">
                  <div className="flex items-center gap-3 mb-6!">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <CreditCardOutlined className="text-white text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Thanh toán
                    </h3>
                  </div>

                  <div className="space-y-3!">
                    {order.payments.map((payment) => (
                      <div
                        key={payment.paymentId}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Phương thức:
                          </span>
                          <Tag
                            color={
                              payment.method === "ONLINE" ? "blue" : "orange"
                            }
                          >
                            {payment.method === "ONLINE"
                              ? "Chuyển khoản"
                              : "COD"}
                          </Tag>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Số tiền:
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6! text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-6!">
                    <CalendarOutlined className="text-2xl" />
                    <h3 className="text-lg font-bold">Tóm tắt đơn hàng</h3>
                  </div>

                  <div className="space-y-3! text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-90">Ngày đặt:</span>
                      <span className="font-medium">
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Tổng sản phẩm:</span>
                      <span className="font-medium">
                        {order.orderDetails.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Tổng số lượng:</span>
                      <span className="font-medium">
                        {order.orderDetails.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        cuốn
                      </span>
                    </div>
                    <Divider
                      style={{
                        borderColor: "rgba(255,255,255,0.3)",
                        margin: "16px 0",
                      }}
                    />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-medium">
                        Tổng thanh toán:
                      </span>
                      <span className="text-3xl font-bold">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Footer */}
          <div className="bg-white px-8! py-5! border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mã đơn hàng:{" "}
              <span className="font-mono font-semibold text-gray-700">
                {order.orderId}
              </span>
            </div>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              size="large"
              className="px-6! h-11! rounded-xl hover:bg-gray-50"
            >
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20! px-8!">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6!">
            <ShoppingOutlined className="text-gray-300 text-5xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không có dữ liệu
          </h3>
          <p className="text-gray-500">
            Không tìm thấy thông tin đơn hàng để hiển thị
          </p>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
