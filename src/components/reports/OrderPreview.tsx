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
  Divider,
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
import {
  ShoppingCartOutlined,
  BookOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const COLORS = ["#52c41a", "#ff4d4f", "#1890ff"]; // xanh lá, đỏ, xanh dương

const OrderPreview = () => {
  const [type, setType] = useState("year");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalOrders: 0, totalSold: 0 });
  const [pieData, setPieData] = useState<any[]>([]);

  // =============================
  // 🔹 Gọi API thống kê đơn hàng
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

      const payload = await http.get(url);
      let raw: any[] = [];
      let totalOrders = 0;

      if (Array.isArray(payload)) raw = payload;
      else if (Array.isArray(payload?.data)) {
        raw = payload.data;
        totalOrders = payload.totalOrders ?? 0;
      } else if (Array.isArray(payload?.data?.data)) {
        raw = payload.data.data;
        totalOrders = payload.data.totalOrders ?? 0;
      }

      const chartData = raw.map((it: any) => ({
        label: it.label,
        COMPLETED: Number(it.COMPLETED ?? 0),
        CANCELLED: Number(it.CANCELLED ?? 0),
      }));

      // 🔹 Dữ liệu biểu đồ tròn
      const sumCompleted = chartData.reduce(
        (s, x) => s + (x.COMPLETED || 0),
        0
      );
      const sumCancelled = chartData.reduce(
        (s, x) => s + (x.CANCELLED || 0),
        0
      );
      const pie = [
        { name: "Hoàn thành", value: sumCompleted },
        { name: "Đã hủy", value: sumCancelled },
      ];

      setData(chartData);
      setPieData(pie);
      setSummary((prev) => ({ ...prev, totalOrders }));
    } catch (err) {
      console.error("Lỗi khi tải thống kê đơn hàng:", err);
      message.error("Không thể tải dữ liệu đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 📚 Gọi API thống kê thể loại
  // =============================
  const fetchCategoryReport = async () => {
    try {
      let url = `/reports/orders?type=category`;
      if (["year", "month"].includes(type)) url += `&year=${year}`;
      if (type === "month") url += `&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const payload = await http.get(url);

      let raw: any[] = [];
      let totalSold = 0;
      if (Array.isArray(payload?.data)) raw = payload.data;
      else if (Array.isArray(payload?.data?.data)) raw = payload.data.data;

      const categoryChart = raw.map((it: any) => ({
        category: it.category,
        totalSold: Number(it.totalSold ?? 0),
      }));

      totalSold = categoryChart.reduce((s, x) => s + (x.totalSold || 0), 0);

      setCategoryData(categoryChart);
      setSummary((prev) => ({ ...prev, totalSold }));
    } catch (err) {
      console.error("Lỗi khi tải thống kê thể loại:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCategoryReport();
  }, [type, year, month, range]);

  // =============================
  // 🎨 Giao diện
  // =============================
  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm min-h-screen">
      <Card
        title="📈 Tổng quan đơn hàng & doanh số"
        className="rounded-2xl shadow-md border border-gray-100"
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
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchOrders();
                fetchCategoryReport();
              }}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Tổng quan */}
        <Row gutter={[16, 16]} className="mb-6 mt-2">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              className="!border !border-indigo-300 rounded-xl shadow-sm"
            >
              <Statistic
                title="Tổng số đơn hàng"
                value={summary.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#722ed1" }} // tím đậm hơn border
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              className="!border !border-blue-400 rounded-xl shadow-sm"
            >
              <Statistic
                title="Tổng sách bán ra"
                value={summary.totalSold}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#0958d9" }} // xanh dương đậm hơn border
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Biểu đồ */}
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <Empty description="Không có dữ liệu đơn hàng" />
        ) : (
          <>
            <Row gutter={[24, 24]} className="mb-8">
              {/* Biểu đồ cột */}
              <Col xs={24} lg={16}>
                <Card
                  title="📊 Đơn hàng theo trạng thái"
                  className="rounded-xl shadow border-gray-100"
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={data}
                      barCategoryGap="20%"
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="COMPLETED"
                        fill="#52c41a"
                        name="Hoàn thành"
                        barSize={35}
                      />
                      <Bar
                        dataKey="CANCELLED"
                        fill="#ff4d4f"
                        name="Đã hủy"
                        barSize={35}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Biểu đồ tròn */}
              <Col xs={24} lg={8}>
                <Card
                  title="🥧 Tỷ lệ trạng thái đơn hàng"
                  className="rounded-xl shadow border-gray-100"
                >
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
                        outerRadius={120}
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
              </Col>
            </Row>

            {/* Thể loại sách */}
            <Card
              title="📚 Thống kê theo thể loại sách"
              className="rounded-xl shadow border-gray-100"
            >
              {categoryData.length === 0 ? (
                <Empty description="Không có dữ liệu thể loại" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="totalSold"
                      fill="#1677ff"
                      barSize={40}
                      name="Số lượng bán"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default OrderPreview;
