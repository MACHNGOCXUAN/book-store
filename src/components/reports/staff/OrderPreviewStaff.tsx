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
import { useAppSelector } from "@/stores/hooks";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const { RangePicker } = DatePicker;

const OrderPreviewStaff = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [type, setType] = useState("month");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrdersChart = async () => {
    try {
      setLoading(true);

      let url = `/reports/staff/orders?staffId=${user.userId}&type=${type}`;

      if (["month", "year", "monthnumber"].includes(type))
        url += `&year=${year}`;
      if (type === "monthnumber") url += `&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const res = await http.get(url);
      const raw = res.chartData ?? res.data?.chartData ?? [];

      setData(
        raw.map((item: any) => ({
          label: item.label,
          orders: Number(item.orders),
        }))
      );
    } catch {
      message.error("Không thể tải biểu đồ đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type !== "range") fetchOrdersChart();
  }, [type, year, month]);

  return (
    <Card
      title="📦 Thống kê số lượng đơn hàng phụ trách"
      className="shadow-md"
      extra={
        <Space wrap>
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

          {type === "range" && (
            <RangePicker
              value={range}
              onChange={setRange}
              format="YYYY-MM-DD"
            />
          )}

          <Button type="primary" onClick={fetchOrdersChart}>
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
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="orders"
              name="Số đơn hàng"
              stroke="#1677ff"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default OrderPreviewStaff;
