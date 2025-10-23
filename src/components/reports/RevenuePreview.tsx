"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  DatePicker,
  Button,
  Spin,
  Empty,
  message,
  Space,
  Row,
  Col,
  Statistic,
} from "antd";
import dayjs from "dayjs";
import http from "@/lib/utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { DollarOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const RevenuePreview = () => {
  const [type, setType] = useState("month");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ đảm bảo không lỗi undefined
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    completedOrders: 0,
  });

  const [fiveYears, setFiveYears] = useState<any[]>([]);
  const [topDays, setTopDays] = useState<any[]>([]);

  // =============================
  // 🔹 Gọi API doanh thu
  // =============================
  const fetchRevenue = async () => {
    try {
      setLoading(true);

      let url = `/reports/revenue?type=${type}`;
      if (["year", "month", "monthnumber"].includes(type))
        url += `&year=${year}`;
      if (type === "monthnumber") url += `&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const res = await http.get(url);

      // ✅ Gán dữ liệu biểu đồ và tổng kết
      setData(res.chartData || []);
      setSummary(res.summary || { totalRevenue: 0, completedOrders: 0 });

      // ✅ Gọi thêm dữ liệu phụ (5 năm + top ngày)
      const five = await http.get("/reports/revenue?type=compare5years");
      const top = await http.get("/reports/revenue?type=topdays");
      setFiveYears(five.chartData || []);
      setTopDays(top.chartData || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      message.error("Không thể tải dữ liệu doanh thu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [type, year, month, range]);

  // =============================
  // 💰 Format VNĐ
  // =============================
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // =============================
  // ⚙️ Render chính
  // =============================
  return (
    <div className="p-4">
      <Card
        title="📊 Thống kê doanh thu"
        extra={
          <Space wrap>
            {/* Loại thống kê */}
            <Select
              value={type}
              onChange={setType}
              style={{ width: 180 }}
              options={[
                { label: "Theo tháng trong năm", value: "month" },
                { label: "Tháng cụ thể", value: "monthnumber" },
                { label: "Theo năm", value: "year" },
                { label: "Khoảng thời gian", value: "range" },
              ]}
            />

            {/* Chọn năm */}
            {(type === "year" ||
              type === "month" ||
              type === "monthnumber") && (
              <Select
                value={year}
                onChange={setYear}
                style={{ width: 100 }}
                options={Array.from({ length: 5 }, (_, i) => {
                  const y = dayjs().year() - i;
                  return { value: y, label: y.toString() };
                })}
              />
            )}

            {/* Chọn tháng */}
            {type === "monthnumber" && (
              <Select
                value={month}
                onChange={setMonth}
                style={{ width: 120 }}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: `Tháng ${i + 1}`,
                }))}
              />
            )}

            {/* Khoảng thời gian */}
            {type === "range" && (
              <RangePicker
                value={range}
                onChange={setRange}
                format="YYYY-MM-DD"
              />
            )}

            <Button type="primary" onClick={fetchRevenue}>
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* ===== Tổng quan theo thời gian ===== */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={summary?.totalRevenue ?? 0}
                prefix={<DollarOutlined />}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Đơn hàng hoàn thành"
                value={summary?.completedOrders ?? 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* ===== Biểu đồ chính ===== */}
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <Empty description="Không có dữ liệu doanh thu" />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1890ff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ===== 5 năm gần nhất ===== */}
      <Card title="📈 Doanh thu 5 năm gần nhất" className="mt-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={fiveYears}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="revenue" fill="#3f8600" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ===== Top 10 ngày có doanh thu cao nhất ===== */}
      <Card title="🔥 Top 10 ngày có doanh thu cao nhất" className="mt-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topDays}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="revenue" fill="#cf1322" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default RevenuePreview;
