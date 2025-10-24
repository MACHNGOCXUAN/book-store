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
import {
  BookOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import http from "@/lib/utils/api";

const { RangePicker } = DatePicker;

const BookPreview = () => {
  const [type, setType] = useState("year");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, lowStockCount: 0 });

  // =============================
  // 🔹 Gọi API thống kê sách
  // =============================
  const fetchBooks = async () => {
    try {
      setLoading(true);

      let url = `/reports/books?type=${type}`;
      if (["year", "month"].includes(type)) url += `&year=${year}`;
      if (type === "month") url += `&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const payload = await http.get(url);

      // 👉 Chuẩn hóa kết quả (dù backend trả có bọc data hay không)
      const result =
        payload?.data &&
        typeof payload.data === "object" &&
        !Array.isArray(payload.data)
          ? payload.data
          : payload;

      console.log("📊 Book report payload:", result);

      // ✅ Dữ liệu bán chạy
      const chartData =
        result?.data?.map((it: any) => ({
          bookTitle: it.bookTitle,
          totalSold: Number(it.totalSold || 0),
        })) ?? [];

      // ✅ Dữ liệu tồn kho thấp (chấp nhận cả key viết hoa)
      const lowStockList = result?.lowStockBooks ?? result?.LowStockBooks ?? [];
      const lowStockCount = result?.lowStockCount ?? result?.LowStockCount ?? 0;
      const totalSold = result?.totalSold ?? result?.TotalSold ?? 0;

      setData(chartData);
      setLowStock(lowStockList);
      setSummary({ totalSold, lowStockCount });
    } catch (err) {
      console.error("❌ Lỗi khi tải thống kê sách:", err);
      message.error("Không thể tải dữ liệu thống kê sách!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [type, year, month, range]);

  // =============================
  // 🎨 Giao diện
  // =============================
  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm min-h-screen">
      <Card
        title="📚 Thống kê sách bán chạy & tồn kho thấp"
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
              onClick={fetchBooks}
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
              className="!border !border-blue-400 rounded-xl"
            >
              <Statistic
                title="Tổng sách đã bán"
                value={summary.totalSold}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#0958d9" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              className="!border !border-red-400 rounded-xl"
            >
              <Statistic
                title="Sách tồn kho thấp (<15)"
                value={summary.lowStockCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ bán chạy */}
        <Card
          title="📊 Top sách bán chạy"
          className="rounded-xl shadow-sm border border-gray-100 mb-8"
        >
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Spin size="large" />
            </div>
          ) : data.length === 0 ? (
            <Empty description="Không có dữ liệu sách bán chạy" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data.slice(0, 10)} // top 10
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="bookTitle" type="category" width={180} />
                <Tooltip formatter={(v) => [`${v} quyển`, "Đã bán"]} />
                <Bar
                  dataKey="totalSold"
                  fill="#1677ff"
                  barSize={20}
                  name="Đã bán"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Bảng tồn kho thấp */}
        <Card
          title="⚠️ Danh sách sách tồn kho thấp"
          className="rounded-xl shadow-sm border border-gray-100"
        >
          {lowStock.length === 0 ? (
            <Empty description="Không có sách tồn kho thấp" />
          ) : (
            <Table
              rowKey="bookId"
              dataSource={lowStock}
              pagination={{ pageSize: 8 }}
              columns={[
                {
                  title: "Mã sách",
                  dataIndex: "bookId",
                  key: "bookId",
                  width: 120,
                },
                { title: "Tên sách", dataIndex: "bookTitle", key: "bookTitle" },
                {
                  title: "Tồn kho",
                  dataIndex: "stock",
                  key: "stock",
                  align: "center",
                  render: (stock: number) => (
                    <Tag color={stock < 10 ? "red" : "orange"}>{stock}</Tag>
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

export default BookPreview;
