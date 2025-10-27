"use client";
import React from "react";
import { TableProps } from "antd";
import { Tag, Space, Button, Dropdown } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { OrderDataType, OrderStatus } from "@/types/order.type";
import { formatCurrency, formatDate } from "@/lib/utils/format";

// const dataMau = {
//   orderId: "ORD-001",
//   orderDate: "2025-10-26T08:30:00",
//   status: "PENDING",
//   totalAmount: 450000,
//   customer: {
//     userId: "USER001",
//     fullName: "Nguyễn Văn An",
//     phoneNumber: "0901234567",
//     email: "nguyenvanan@email.com",
//     address: "123 Lê Lợi, Quận 1, TP.HCM",
//   },
//   payments: [
//     {
//       paymentId: "PAY-001",
//       amount: 450000,
//       method: "COD",
//     },
//   ],
//   orderDetails: [
//     {
//       orderDetailId: "OD-001",
//       quantity: 2,
//       unitPrice: 150000,
//       totalPrice: 300000,
//       book: {
//         bookId: "B001",
//         title: "Đắc Nhân Tâm",
//         author: "Dale Carnegie",
//         publisher: "NXB Tổng Hợp",
//         price: 150000,
//         category: "Kỹ năng sống",
//         coverImage: "https://batansach.com/wp-content/uploads/2024/11/kara.jpg",
//       },
//     },
//     {
//       orderDetailId: "OD-002",
//       quantity: 1,
//       unitPrice: 150000,
//       totalPrice: 150000,
//       book: {
//         bookId: "B002",
//         title: "Nhà Giả Kim",
//         author: "Paulo Coelho",
//         publisher: "NXB Hội Nhà Văn",
//         price: 150000,
//         category: "Tiểu thuyết",
//         coverImage: "https://batansach.com/wp-content/uploads/2024/11/kara.jpg",
//       },
//     },
//   ],
// };

const statusLabel: Record<OrderStatus, string> = {
  PENDING: "Vừa tạo",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const statusColor: Record<OrderStatus, string> = {
  PENDING: "gold",
  PROCESSING: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case "PENDING":
      return ["PROCESSING", "CANCELLED"];
    case "PROCESSING":
      return ["COMPLETED", "CANCELLED"];
    case "COMPLETED":
      return [];
    case "CANCELLED":
      return [];
    default:
      return [];
  }
};

export const orderColumns = (
  onViewDetail: (orderId: string) => void,
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void,
  // onCancelOrder: (orderId: string) => void
): TableProps<OrderDataType>["columns"] => [
  {
    title: "Mã đơn",
    dataIndex: "orderId",
    key: "orderId",
    width: 120,
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: "Khách hàng",
    key: "customer",
    width: 200,
    render: (_, record: OrderDataType) => (
      <div>
        <div style={{ fontWeight: 500 }}>
          {record.customer.fullName || "Chưa có tên"}
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {record.customer.phoneNumber}
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {record.customer.email}
        </div>
      </div>
    ),
  },
  {
    title: "Sản phẩm",
    key: "products",
    width: 150,
    render: (_, record: OrderDataType) => (
      <div>
        <div style={{ fontWeight: 500 }}>
          {record.orderDetails.length} sản phẩm
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          Tổng SL:{" "}
          {record.orderDetails.reduce((sum, item) => sum + item.quantity, 0)}
        </div>
      </div>
    ),
  },
  {
    title: "Thanh toán",
    key: "payment",
    width: 120,
    render: (_, record: OrderDataType) => (
      <div>
        {record.payments.map((payment) => (
          <Tag
            key={payment.paymentId}
            color={payment.method === "ONLINE" ? "blue" : "orange"}
          >
            {payment.method}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: "Tổng tiền",
    dataIndex: "totalAmount",
    key: "totalAmount",
    width: 130,
    render: (amount: number) => (
      <span style={{ fontWeight: 600, color: "#1890ff" }}>
        {formatCurrency(amount)}
      </span>
    ),
  },
  {
    title: "Ngày đặt",
    dataIndex: "orderDate",
    key: "orderDate",
    width: 150,
    render: (date: string) => formatDate(date),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status: OrderStatus) => (
      <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>
    ),
  },
  {
    title: "Thao tác",
    key: "action",
    width: 280,
    fixed: "right",
    render: (_: any, record: OrderDataType) => {
      const availableStatuses = getAvailableStatuses(record.status);
      const statusMenuItems = availableStatuses.map((status) => ({
        key: status,
        label: statusLabel[status],
      }));

      return (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record.orderId)}
          >
            Chi tiết
          </Button>

          {availableStatuses.length > 0 && (
            <Dropdown
              menu={{
                items: statusMenuItems,
                onClick: ({ key }: any) => {
                  // console.log("xuan:", {
                  //   orderId: record.orderId,
                  //   fromStatus: record.status,
                  //   toStatus: key,
                  // });
                  onUpdateStatus(record.orderId, key)
                },
              }}
              trigger={["click"]}
            >
              <Button type="primary">Cập nhật trạng thái</Button>
            </Dropdown>
          )}

          {(record.status === "PENDING" || record.status === "PROCESSING") && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                console.log("Hủy đơn hàng:", record.orderId);
              }}
            >
              Hủy
            </Button>
          )}
        </Space>
      );
    },
  },
];
