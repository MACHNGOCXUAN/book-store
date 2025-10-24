"use client";
import React from "react";
import { TableProps } from "antd";
import { Tag, Space, Button, Dropdown, Menu } from "antd";
import { EyeOutlined, MoreOutlined, DeleteOutlined } from "@ant-design/icons";
import type { OrderDataType, OrderStatus } from "@/types/order.type";

const statusLabel: Record<OrderStatus, string> = {
  CHỜ_XU_LÝ: "Chờ xử lý",
  DANG_XU_LY: "Đang xử lý",
  DANG_GIAO_HANG: "Đang giao hàng",
  HOAN_TAT: "Hoàn tất",
  HUY: "Hủy",
};

const statusColor: Record<OrderStatus, string> = {
  CHỜ_XU_LÝ: "gold",
  DANG_XU_LY: "blue",
  DANG_GIAO_HANG: "purple",
  HOAN_TAT: "green",
  HUY: "volcano",
};

export const orderData: OrderDataType[] = [
  {
    id: "ORD-1001",
    customerId: "CUS-001",
    bookId: "BOOK-101",
    status: "CHỜ_XU_LÝ",
    total: "120.000 VND",
    dateOrder: "2025-10-18",
  },
  {
    id: "ORD-1002",
    customerId: "CUS-002",
    bookId: "BOOK-203",
    status: "DANG_XU_LY",
    total: "250.000 VND",
    dateOrder: "2025-10-19",
  },
  {
    id: "ORD-1003",
    customerId: "CUS-003",
    bookId: "BOOK-305",
    status: "DANG_GIAO_HANG",
    total: "75.000 VND",
    dateOrder: "2025-10-20",
  },
  {
    id: "ORD-1004",
    customerId: "CUS-004",
    bookId: "BOOK-410",
    status: "HOAN_TAT",
    total: "320.000 VND",
    dateOrder: "2025-09-30",
  },
  {
    id: "ORD-1005",
    customerId: "CUS-005",
    bookId: "BOOK-512",
    status: "HUY",
    total: "0 VND",
    dateOrder: "2025-08-12",
  },
];

export const orderColumns: TableProps<OrderDataType>["columns"] = [
  {
    title: "Mã đơn",
    dataIndex: "id",
    key: "id",
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: "Mã khách hàng",
    dataIndex: "customerId",
    key: "customerId",
  },
  {
    title: "Mã sách",
    dataIndex: "bookId",
    key: "bookId",
  },
  {
    title: "Tổng tiền",
    dataIndex: "total",
    key: "total",
  },
  {
    title: "Ngày đặt",
    dataIndex: "dateOrder",
    key: "dateOrder",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: OrderStatus, record: OrderDataType) => (
      <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>
    ),
  },
  {
    title: "Thao tác",
    key: "action",
    width: 220,
    render: (_: any, record: OrderDataType) => {
      const menu = (
        <Menu
          onClick={({ key }) => {
            console.log("change status", record.id, key);
          }}
        >
          <Menu.Item key="CHỜ_XU_LÝ">Chờ xử lý</Menu.Item>
          <Menu.Item key="DANG_XU_LY">Đang xử lý</Menu.Item>
          <Menu.Item key="DANG_GIAO_HANG">Đang giao hàng</Menu.Item>
          <Menu.Item key="HOAN_TAT">Hoàn tất</Menu.Item>
          <Menu.Item key="HUY">Hủy</Menu.Item>
        </Menu>
      );

      return (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              console.log("view order", record.id);
            }}
          >
            Xem chi tiết
          </Button>

          <Dropdown
            menu={{
              items: [
                { key: "CHỜ_XU_LÝ", label: "Chờ xử lý" },
                { key: "DANG_XU_LY", label: "Đang xử lý" },
                { key: "DANG_GIAO_HANG", label: "Đang giao hàng" },
                { key: "HOAN_TAT", label: "Hoàn tất" },
                { key: "HUY", label: "Hủy" },
              ],
              onClick: ({ key }) => {
                console.log("Đổi trạng thái:", record.id, key);
              },
            }}
            trigger={["click"]}
          >
            <Button icon={<MoreOutlined />}>Thay đổi trạng thái</Button>
          </Dropdown>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              console.log("delete order", record.id);
            }}
          />
        </Space>
      );
    },
  },
];
