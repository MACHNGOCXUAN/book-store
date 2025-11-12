"use client";
import OrderDetailModal from "@/components/order/modelOrderDetail";
import { orderColumns } from "@/components/order/ordersTable";
import { Table } from "@/components/table/table";
import { useMyNotification } from "@/hooks/notification";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  getFilterOrder,
  getOrderById,
  resetMessage,
  updateStatusOrder,
} from "@/stores/slices/order.slice";
import { OrderDataType, OrderStatus } from "@/types/order.type";
import { Button, DatePicker, Input, Select, Spin, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export default function OrderPage() {
  const dispatch = useAppDispatch();
  const { openNotification, contextHolder } = useMyNotification();
  const { loading, pagination, listOrder } = useAppSelector(
    (state) => state.order
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { order: orderSelect, message } = useAppSelector(
    (state) => state.order
  );
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  useEffect(() => {
    dispatch(getFilterOrder({}));
  }, [dispatch]);

  useEffect(() => {
    if (message?.type == "success") {
      dispatch(getFilterOrder({}));
      openNotification("success", message?.message);
    }
    dispatch(resetMessage());
  }, [message]);

  const handleViewDetail = (orderId: string) => {
    dispatch(getOrderById(orderId));
    setIsModalOpen(true);
  };

  const handleUpdateStatusOrder = (orderId: String, status: OrderStatus) => {
    dispatch(
      updateStatusOrder({
        orderId,
        status,
      })
    );
  };

  const handleResetFilter = () => {
    setSearchText("");
    setStatusFilter("ALL");
    setDateRange(null);
    dispatch(getFilterOrder({}));
  };

  const handleApplyFilter = () => {
    const startTime = dateRange?.[0]
      ? dateRange[0].startOf("day").toISOString()
      : null;
    const endTime = dateRange?.[1]
      ? dateRange[1].endOf("day").toISOString()
      : null;

    dispatch(
      getFilterOrder({
        textSearch: searchText,
        status: statusFilter === "ALL" ? null : statusFilter,
        startTime,
        endTime,
      })
    );
  };

  const handlePageChange = (page: number, pageSize: number) => {
    const startTime = dateRange?.[0]
      ? dateRange[0].startOf("day").toISOString()
      : null;
    const endTime = dateRange?.[1]
      ? dateRange[1].endOf("day").toISOString()
      : null;
    dispatch(
      getFilterOrder({
        page: page,
        limit: pageSize,
        textSearch: searchText,
        status: statusFilter === "ALL" ? null : statusFilter,
        startTime,
        endTime,
      })
    );
  };

  const createColumns = orderColumns(handleViewDetail, handleUpdateStatusOrder);

  return (
    <div className="boxpage">
      {contextHolder}
      <div className="boxItemPage">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileTextOutlined className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 m-0">
                Quản lý đơn hàng
              </h1>
              <p className="text-sm text-gray-500 m-0">
                Tổng số:{" "}
                <span className="font-semibold text-blue-600">
                  {listOrder?.length || 0}
                </span>{" "}
                đơn hàng
              </p>
            </div>
          </div>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => dispatch(getFilterOrder({}))}
            className="flex items-center"
          >
            Làm mới
          </Button>
        </div>
      </div>
      <div className="boxItemPage">
        <div className="flex flex-col gap-5">
          <h3 className="font-bold text-2xl">Bộ lọc tìm kiếm</h3>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Tìm kiếm
                </label>
                <Input
                  placeholder="Mã đơn, tên khách hàng..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Trạng thái
                </label>
                <Select
                  placeholder="Chọn trạng thái"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-full"
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "PENDING", label: "Chờ xử lý" },
                    { value: "PROCESSING", label: "Đang xử lý" },
                    { value: "SHIPPING", label: "Đang giao" },
                    { value: "COMPLETED", label: "Đã giao" },
                    { value: "CANCELLED", label: "Đã hủy" },
                  ]}
                  allowClear
                />
              </div>
            </Col>

            <Col xs={24} sm={24} lg={12}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Khoảng thời gian
                </label>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  placeholder={["Từ ngày", "Đến ngày"]}
                  className="w-full"
                  format="DD/MM/YYYY"
                />
              </div>
            </Col>
            <Col xs={24}>
              <div className="flex justify-end gap-3 pt-2!">
                <Button
                  onClick={handleResetFilter}
                  className="h-10 px-6"
                  icon={<ReloadOutlined />}
                >
                  Xóa lọc
                </Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleApplyFilter}
                  className="h-10 px-6"
                >
                  Tìm kiếm
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <div className="boxItemPage">
        <Table<OrderDataType>
          columns={createColumns}
          data={listOrder || []}
          rowKey="orderId"
          loading={loading}
          pagination={{
            showQuickJumper: false,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            current: pagination ? pagination.curPage : 1,
            pageSize: pagination ? pagination.limitPage : 10,
            total: pagination ? pagination.totalRows : listOrder?.length,
            onChange: (page, pageSize) => {
              handlePageChange(page, pageSize);
            },
          }}
        />
      </div>

      <OrderDetailModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        order={orderSelect || null}
        onUpdateStatus={handleUpdateStatusOrder}
      />
    </div>
  );
}
