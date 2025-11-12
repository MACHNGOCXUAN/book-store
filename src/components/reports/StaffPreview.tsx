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
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import http from "@/lib/utils/api";
import { CrownFilled } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const StaffPreview = () => {
  const [type, setType] = useState("all");
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [range, setRange] = useState<any>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      let url = `/reports/admin/staff?type=${type}`;

      if (type === "year") url += `&year=${year}`;
      if (type === "month") url += `&year=${year}&month=${month}`;
      if (type === "range" && range)
        url += `&startDate=${range[0].format(
          "YYYY-MM-DD"
        )}&endDate=${range[1].format("YYYY-MM-DD")}`;

      const res = await http.get(url);
      setData(res.topStaff ?? []);
    } catch {
      message.error("Không thể tải dữ liệu nhân viên!");
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
      align: "center",
      width: 90,
      render: (_: any, __: any, index: number) => {
        const rank = index + 1;
        if (rank === 1)
          return <CrownFilled style={{ fontSize: 26, color: "#ff4d4f" }} />;
        if (rank === 2)
          return <CrownFilled style={{ fontSize: 26, color: "#faad14" }} />;
        if (rank === 3)
          return <CrownFilled style={{ fontSize: 26, color: "#52c41a" }} />;
        return <b style={{ fontSize: 14 }}>{rank}</b>;
      },
    },
    {
      title: "Mã nhân viên",
      dataIndex: "staffId",
      width: 140,
    },
    {
      title: "Tên nhân viên",
      dataIndex: "staffName",
      ellipsis: true,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      align: "center",
      width: 200,
      render: (v: number) => (
        <span style={{ fontWeight: 700, color: "#1677ff" }}>
          {v.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
  ];

  return (
    <Card
      title={
        <span style={{ fontSize: 18, fontWeight: 600 }}>
          💼 Xếp hạng nhân viên theo doanh thu
        </span>
      }
      style={{
        marginTop: 16,
        borderRadius: 14,
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
      extra={
        <Space wrap size="middle">
          <Select
            size="large"
            value={type}
            onChange={setType}
            style={{ width: 180 }}
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
              value={year}
              onChange={setYear}
              style={{ width: 140 }}
              options={Array.from({ length: 6 }, (_, i) => ({
                value: dayjs().year() - i,
                label: dayjs().year() - i,
              }))}
            />
          )}

          {type === "month" && (
            <Select
              size="large"
              value={month}
              onChange={setMonth}
              style={{ width: 140 }}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: `Tháng ${i + 1}`,
              }))}
            />
          )}

          {type === "range" && (
            <RangePicker size="large" value={range} onChange={setRange} />
          )}

          <Button
            size="large"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchData}
          >
            Làm mới
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <Empty description="Không có dữ liệu" />
      ) : (
        <Table
          bordered
          style={{ marginTop: 15 }}
          pagination={{ pageSize: 7 }}
          dataSource={data.map((i, index) => ({
            ...i,
            key: index,
            rank: index + 1,
          }))}
          columns={columns}
        />
      )}
    </Card>
  );
};

export default StaffPreview;
