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
  Table,
  Tag,
} from "antd";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UserOutlined, ReloadOutlined, CrownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import http from "@/lib/utils/api";

const { RangePicker } = DatePicker;

const CustomerPreview = () => {
  const [type, setType] = useState("year");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [loading, setLoading] = useState(false);
  const [newCustomers, setNewCustomers] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    totalNewCustomers: 0,
  });

  // =============================
  // 🔹 Gọi API thống kê khách hàng
  // =============================
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      let url = `/reports/customers?type=${type}`;
      if (["year", "month"].includes(type)) url += `&year=${year}`;
      if (type === "month") url += `&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const payload = await http.get(url);

      const result =
        payload?.data &&
        typeof payload.data === "object" &&
        !Array.isArray(payload.data)
          ? payload.data
          : payload;

      console.log("📈 Customer Report Payload:", result);

      const newCustomers = result?.newCustomers ?? result?.NewCustomers ?? [];
      const topCustomers = result?.topCustomers ?? result?.TopCustomers ?? [];
      const totalCustomers =
        result?.totalCustomers ?? result?.TotalCustomers ?? 0;
      const totalNewCustomers =
        result?.totalNewCustomers ?? result?.TotalNewCustomers ?? 0;

      setNewCustomers(newCustomers);
      setTopCustomers(topCustomers);
      setSummary({ totalCustomers, totalNewCustomers });
    } catch (err) {
      console.error("❌ Lỗi khi tải thống kê khách hàng:", err);
      message.error("Không thể tải dữ liệu thống kê khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [type, year, month, range]);

  // =============================
  // 🎨 Giao diện
  // =============================
  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm min-h-screen">
      <Card
        title="👥 Thống kê khách hàng"
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
              onClick={fetchCustomers}
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
              className="bg-gradient-to-r from-sky-50 to-white border border-sky-400 rounded-xl shadow-sm"
            >
              <Statistic
                title="Tổng khách hàng"
                value={summary.totalCustomers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1677ff" }} // xanh dương đậm
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              className="bg-gradient-to-r from-amber-50 to-white border border-amber-400 rounded-xl shadow-sm"
            >
              <Statistic
                title="Khách hàng mới"
                value={summary.totalNewCustomers}
                prefix={<CrownOutlined />}
                valueStyle={{ color: "#faad14" }} // vàng ánh kim, nổi bật
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ khách hàng mới */}
        <Card
          title="📊 Khách hàng mới theo thời gian"
          className="rounded-xl shadow-sm border border-gray-100 mb-8"
        >
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Spin size="large" />
            </div>
          ) : newCustomers.length === 0 ? (
            <Empty description="Không có dữ liệu khách hàng mới" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={newCustomers}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [`${v} khách hàng`, "Số lượng mới"]}
                />
                <Bar
                  dataKey="total"
                  fill="#52c41a"
                  barSize={35}
                  name="Khách hàng mới"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Bảng top khách hàng */}
        <Card
          title="🏆 Top khách hàng có nhiều đơn hàng nhất"
          className="rounded-xl shadow-sm border border-gray-100"
        >
          {topCustomers.length === 0 ? (
            <Empty description="Không có dữ liệu khách hàng" />
          ) : (
            <Table
              rowKey="name"
              dataSource={topCustomers}
              pagination={{ pageSize: 8 }}
              columns={[
                {
                  title: "Tên khách hàng",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Số đơn hàng",
                  dataIndex: "totalOrders",
                  key: "totalOrders",
                  align: "center",
                  render: (val: number) => (
                    <Tag
                      color={val >= 10 ? "green" : val >= 5 ? "blue" : "orange"}
                    >
                      {val}
                    </Tag>
                  ),
                },
              ]}
            />
          )}
        </Card>
      </Card>
    </div>
  );
};

export default CustomerPreview;
