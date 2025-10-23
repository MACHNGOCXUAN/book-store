"use client";
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, Tabs } from "antd";
import {
  DollarOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import http from "@/lib/utils/api";
import RevenuePreview from "@/components/reports/RevenuePreview";
import OrderPreview from "@/components/reports/OrderPreview";

const ReportOverview = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await http.get("/reports/admin/overview");
        setData(res);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">📊 Thống kê tổng quan</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Tổng doanh thu"
              value={data.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Số sách đang bán"
              value={data.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Tổng khách hàng"
              value={data.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Tổng đơn hàng"
              value={data.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="1"
        className="mt-8"
        items={[
          { key: "1", label: "📈 Doanh thu", children: <RevenuePreview /> },
          // { key: "2", label: "📚 Sách bán chạy", children: <BookPreview /> },
          // { key: "3", label: "👥 Khách hàng", children: <CustomerPreview /> },
          { key: "4", label: "🧾 Đơn hàng", children: <OrderPreview /> },
        ]}
      />
    </div>
  );
};

export default ReportOverview;
