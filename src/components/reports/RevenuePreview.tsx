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
  Legend,
} from "recharts";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

const RevenuePreview = () => {
  const [type, setType] = useState("month");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    completedOrders: 0,
  });

  const [fiveYears, setFiveYears] = useState<any[]>([]);
  const [topDays, setTopDays] = useState<any[]>([]);

  // =============================
  // 🔹 Gọi API doanh thu & lợi nhuận
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

      setData(res.chartData || []);
      setSummary(
        res.summary || { totalRevenue: 0, totalProfit: 0, completedOrders: 0 }
      );

      // ✅ Dữ liệu phụ
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
      maximumFractionDigits: 0,
    }).format(value);

  // =============================
  // ⚙️ Render chính
  // =============================
  return (
    <div className="p-4">
      <Card
        title="📊 Thống kê doanh thu & lợi nhuận"
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

            {/* Năm */}
            {["year", "month", "monthnumber"].includes(type) && (
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

            {/* Tháng */}
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
        {/* ===== Tổng quan ===== */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              className="!border !border-green-400 rounded-xl"
            >
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
            <Card
              bordered={false}
              className="!border !border-yellow-400 rounded-xl"
            >
              <Statistic
                title="Tổng lợi nhuận"
                value={summary?.totalProfit ?? 0}
                prefix={<RiseOutlined />}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              className="!border !border-blue-400 rounded-xl"
            >
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
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#1890ff"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Lợi nhuận"
                stroke="#faad14"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ===== 2 Biểu đồ phụ ===== */}
      <div style={{ marginTop: 10 }}>
        <Row gutter={[16, 16]} className="mt-8">
          <Col xs={24} md={12}>
            <Card title="📈 Doanh thu & lợi nhuận 5 năm gần nhất">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fiveYears}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3f8600" name="Doanh thu" />
                  <Bar dataKey="profit" fill="#faad14" name="Lợi nhuận" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="🔥 Top 10 ngày có doanh thu & lợi nhuận cao nhất">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topDays}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#cf1322" name="Doanh thu" />
                  <Bar dataKey="profit" fill="#faad14" name="Lợi nhuận" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RevenuePreview;
