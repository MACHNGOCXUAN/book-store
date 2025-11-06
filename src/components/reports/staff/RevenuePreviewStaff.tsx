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
} from "recharts";
import { useAppSelector } from "@/stores/hooks";

const { RangePicker } = DatePicker;

const RevenuePreviewStaff = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [type, setType] = useState("month"); // default: theo tháng trong năm
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRevenue = async () => {
    try {
      setLoading(true);

      let url = `/reports/staff/revenue?staffId=${user.userId}&type=${type}`;

      if (["year", "month", "monthnumber"].includes(type))
        url += `&year=${year}`;
      if (type === "monthnumber") url += `&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const res = await http.get(url);

      setData(res.chartData || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải biểu đồ doanh thu cá nhân!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [type, year, month, range]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card
      title="📈 Biểu đồ doanh thu cá nhân"
      extra={
        <Space wrap>
          {/* kiểu thống kê */}
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

          {/* chọn năm */}
          {["year", "month", "monthnumber"].includes(type) && (
            <Select
              value={year}
              onChange={setYear}
              style={{ width: 100 }}
              options={Array.from({ length: 5 }, (_, i) => ({
                value: dayjs().year() - i,
                label: (dayjs().year() - i).toString(),
              }))}
            />
          )}

          {/* chọn tháng */}
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

          {/* chọn khoảng thời gian */}
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
      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <Empty description="Không có dữ liệu" />
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
              name="Doanh thu"
              stroke="#3f8600"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RevenuePreviewStaff;
