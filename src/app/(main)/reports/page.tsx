"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Tabs,
  Typography,
  Select,
  Space,
  message,
} from "antd";
import {
  DollarOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import http from "@/lib/utils/api";
import RevenuePreview from "@/components/reports/RevenuePreview";
import OrderPreview from "@/components/reports/OrderPreview";
import BookPreview from "@/components/reports/BookPreview";
import CustomerPreview from "@/components/reports/CustomerPreview";

const { Title, Text } = Typography;

const ReportOverview = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<string>("today"); // "today" hoặc "all"

  // ==============================
  // 🧭 Gọi API tổng quan
  // ==============================
  const fetchOverview = async (selectedMode: string) => {
    try {
      setLoading(true);
      const res = await http.get(
        `/reports/admin/overview?mode=${selectedMode}`
      );
      setData(res);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      message.error("Không thể tải dữ liệu tổng quan!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(mode);
  }, [mode]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );

  // ==============================
  // 💰 Format tiền tệ
  // ==============================
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // ==============================
  // ⚙️ Giao diện chính
  // ==============================
  return (
    <div className="p-6 boxpage bg-gray-50 min-h-screen">
      {/* ============================= */}
      {/* 🏷️ Header */}
      {/* ============================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <Title level={3} className="!mb-1">
            Thống kê tổng quan
          </Title>
          <Text type="secondary" style={{ paddingTop: 5 }}>
            {data.mode === "Hôm nay"
              ? `Dữ liệu ngày ${data.date}`
              : "Dữ liệu toàn bộ hệ thống"}
          </Text>
        </div>

        {/* 🔄 Chọn chế độ */}
        <Space>
          <Select
            value={mode}
            onChange={(value) => setMode(value)}
            style={{ width: 180 }}
            options={[
              { label: "Hôm nay", value: "today" },
              { label: "Tất cả", value: "all" },
            ]}
          />
        </Space>
      </div>

      {/* ============================= */}
      {/* 💡 Thẻ thống kê nhanh */}
      {/* ============================= */}
      <Row gutter={[16, 16]} className="!mt-3">
        <Col xs={24} sm={12} md={6}>
          <Card hoverable bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Tổng doanh thu"
              value={data.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Tổng lợi nhuận"
              value={data.totalProfit}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#0958d9" }}
              formatter={(val) => formatCurrency(Number(val))}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Đơn hàng hoàn thành"
              value={data.completedOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Tổng đơn hàng"
              value={data.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 7 }}>
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} sm={12} md={6}>
            <Card hoverable bordered={false} className="shadow-sm rounded-xl">
              <Statistic
                title="Tổng sách đang bán"
                value={data.totalBooks}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable bordered={false} className="shadow-sm rounded-xl">
              <Statistic
                title="Tổng khách hàng"
                value={data.totalCustomers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* ============================= */}
      {/* 📑 Tabs thống kê chi tiết */}
      {/* ============================= */}
      <div
        className="mt-10 bg-white p-4 rounded-xl shadow-sm"
        style={{ marginTop: 10 }}
      >
        <Tabs
          defaultActiveKey="1"
          size="large"
          tabBarStyle={{ marginBottom: 0 }}
          items={[
            {
              key: "1",
              label: "📈 Doanh thu",
              children: <RevenuePreview />,
            },
            {
              key: "2",
              label: "🧾 Đơn hàng",
              children: <OrderPreview />,
            },
            {
              key: "3",
              label: "📚 Sách",
              children: <BookPreview />,
            },
            {
              key: "4",
              label: "👥 Khách hàng",
              children: <CustomerPreview />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ReportOverview;
