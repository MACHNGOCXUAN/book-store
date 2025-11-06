"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  DatePicker,
  Button,
  Space,
  Spin,
  Empty,
  Table,
  Tag,
  message,
} from "antd";
import http from "@/lib/utils/api";
import dayjs from "dayjs";
import { useAppSelector } from "@/stores/hooks";

const { RangePicker } = DatePicker;

const BookPreviewStaff = () => {
  const { user } = useAppSelector((state) => state.auth);
  const staffId = user?.userId;

  const [type, setType] = useState("all");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<any>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      if (!staffId) return;
      setLoading(true);

      let url = `/reports/staff/books?staffId=${staffId}&type=${type}`;

      if (type === "year") url += `&year=${year}`;
      if (type === "month") url += `&year=${year}&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const res = await http.get(url);
      setData(res.topBooks ?? []);
    } catch {
      message.error("Không thể tải dữ liệu sách!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, year, month, range]);

  const columns = [
    {
      title: "Hạng",
      dataIndex: "rank",
      width: 100,
      align: "center",
      render: (rank: number) => {
        const colors: Record<number, string> = {
          1: "gold",
          2: "geekblue",
          3: "volcano",
        };

        return (
          <Tag
            color={colors[rank] ?? "default"}
            style={{
              fontWeight: 600,
              padding: "4px 10px",
              fontSize: 15,
              borderRadius: 6,
            }}
          >
            {rank}
          </Tag>
        );
      },
    },
    {
      title: "Tên sách",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "Số lượng đã bán",
      dataIndex: "quantity",
      align: "center",
      width: 160,
      render: (q: number) => (
        <span style={{ color: "#cf1322", fontWeight: 600 }}>{q} quyển</span>
      ),
    },
  ];

  return (
    <Card
      title="📚 Sách tôi đã bán"
      style={{ marginTop: 16 }}
      bordered={false}
      extra={
        <Space wrap>
          <Select
            size="large"
            style={{ width: 180 }}
            value={type}
            onChange={setType}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "year", label: "Theo năm" },
              { value: "month", label: "Theo tháng" },
              { value: "range", label: "Khoảng thời gian" },
            ]}
          />

          {["year", "month"].includes(type) && (
            <Select
              size="large"
              style={{ width: 120 }}
              value={year}
              onChange={setYear}
              options={Array.from({ length: 6 }, (_, i) => ({
                value: dayjs().year() - i,
                label: dayjs().year() - i,
              }))}
            />
          )}

          {type === "month" && (
            <Select
              size="large"
              style={{ width: 120 }}
              value={month}
              onChange={setMonth}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: `Tháng ${i + 1}`,
              }))}
            />
          )}

          {type === "range" && (
            <RangePicker size="large" value={range} onChange={setRange} />
          )}

          <Button size="large" type="primary" onClick={fetchData}>
            Làm mới
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <Empty description="Không có dữ liệu sách" />
      ) : (
        <Table
          bordered
          pagination={{ pageSize: 6 }}
          dataSource={data.map((item, index) => ({
            key: index,
            rank: index + 1, // ✅ Rank hoàn toàn động
            ...item,
          }))}
          columns={columns}
        />
      )}
    </Card>
  );
};

export default BookPreviewStaff;
