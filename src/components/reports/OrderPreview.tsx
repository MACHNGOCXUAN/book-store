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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const COLORS = ["#3f8600", "#1890ff", "#cf1322", "#722ed1", "#faad14"];

const OrderPreview = () => {
  const [type, setType] = useState("year");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalOrders: 0,
  });
  const [pieData, setPieData] = useState<any[]>([]);

  // =============================
  // 🔹 Gọi API
  // =============================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      let url = `/reports/orders?type=${type}`;
      if (["year", "month"].includes(type)) url += `&year=${year}`;
      if (type === "month") url += `&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const res = await http.get(url);
      const raw = res.data || [];

      // 🔹 Tổng hợp dữ liệu theo status
      const grouped: Record<string, Record<string, number>> = {};
      const statusSummary: Record<string, number> = {};

      raw.forEach((item: any) => {
        const label = item.label;
        const status = item.status;
        const total = item.totalOrders;

        if (!grouped[label]) grouped[label] = {};
        grouped[label][status] = (grouped[label][status] || 0) + total;

        statusSummary[status] = (statusSummary[status] || 0) + total;
      });

      // 🔹 Biến đổi thành mảng cho biểu đồ cột
      const chartData = Object.keys(grouped).map((label) => ({
        label,
        ...grouped[label],
      }));

      // 🔹 Biểu đồ tròn theo trạng thái
      const pie = Object.keys(statusSummary).map((status) => ({
        name: status,
        value: statusSummary[status],
      }));

      // ✅ Gán state
      setData(chartData);
      setPieData(pie);
      setSummary({ totalOrders: res.totalOrders || 0 });
    } catch (err) {
      console.error("Lỗi khi tải thống kê đơn hàng:", err);
      message.error("Không thể tải dữ liệu đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [type, year, month, range]);

  return (
    <div className="p-4">
      <Card
        title="🧾 Thống kê đơn hàng"
        extra={
          <Space wrap>
            <Select
              value={type}
              onChange={setType}
              style={{ width: 180 }}
              options={[
                { label: "Theo năm", value: "year" },
                { label: "Theo tháng cụ thể", value: "month" },
                { label: "Theo khoảng thời gian", value: "range" },
              ]}
            />

            {(type === "year" || type === "month") && (
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

            {type === "month" && (
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

            {type === "range" && (
              <RangePicker
                value={range}
                onChange={setRange}
                format="YYYY-MM-DD"
              />
            )}

            <Button type="primary" onClick={fetchOrders}>
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Tổng đơn hàng */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              style={{
                border: "1px solid black",
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Statistic
                title="Tổng số đơn hàng"
                value={summary?.totalOrders ?? 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ chính */}
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <Empty description="Không có dữ liệu đơn hàng" />
        ) : (
          <>
            {/* ===== Biểu đồ cột stacked ===== */}
            <Card title="📊 Biểu đồ đơn hàng theo trạng thái" className="mb-8">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(data[0])
                    .filter((key) => key !== "label")
                    .map((status, i) => (
                      <Bar
                        key={status}
                        dataKey={status}
                        stackId="orders"
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* ===== Biểu đồ tròn ===== */}
            <Card title="🥧 Tỷ lệ trạng thái đơn hàng">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default OrderPreview;
