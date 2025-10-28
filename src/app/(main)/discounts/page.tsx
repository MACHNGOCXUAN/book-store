"use client";
import {
  Button,
  Col,
  Collapse,
  type CollapseProps,
  Form,
  Input,
  Row,
  Select,
  Space,
  type TableProps,
  Tag,
  Modal, // <-- THÊM VÀO
} from "antd";
// Sửa đổi useState
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Table } from "@/components/table/table";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { useMyNotification } from "@/hooks/notification";
import {
  getDiscountsFilter,
  resetMessage,
  getDiscountById, // <-- THÊM VÀO
} from "@/stores/slices/discount.slice";

// THÊM VÀO: Import Modal
import ModalAddDiscount from "@/components/Model/model-add-discount"; // <-- Cập nhật đường dẫn này

// ... (Interface DiscountDataType giữ nguyên) ...
interface DiscountDataType {
  discountId: string;
  name: string;
  percent: number;
  startDate: string;
  endDate: string;
  description: string;
  quantity: number;
  minPriceToApply: number;
  discountType: "ONE_TIME" | "MANY_TIME";
  maxQuantityCanUse: number;
}


export default function DiscountPage() {
  const [form] = Form.useForm();
  
  // THÊM VÀO: State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // THÊM VÀO: State cho Filter (để giữ filter khi chuyển trang)
  const [filters, setFilters] = useState<any>({});

  const dispatch = useAppDispatch();
  const { listDiscount, pagination, message } = useAppSelector(
    (state: any) => state.discount
  );
  const { openNotification, contextHolder } = useMyNotification();

  // Lấy dữ liệu khi load (chỉ 1 lần)
  useEffect(() => {
    dispatch(getDiscountsFilter({}));
  }, [dispatch]);

  // Xử lý thông báo (cho XÓA)
  useEffect(() => {
    // Chỉ xử lý message khi *không* mở modal
    // (Vì modal tự xử lý message Thêm/Sửa)
    if (message && !isModalOpen) {
      if (message.type == "success") {
        openNotification("success", message?.message);
      } else {
        openNotification("error", message?.message);
      }
      // Load lại dữ liệu (sau khi Xóa thành công)
      dispatch(getDiscountsFilter(filters));
      dispatch(resetMessage());
    }
  }, [message, dispatch, isModalOpen, filters]); // Thêm isModalOpen, filters

  // ... (useEffect console.log giữ nguyên) ...

  // SỬA ĐỔI: handlePageChange (thêm filter)
  const handlePageChange = (page: number, pageSize: number) => {
    const newQuery = { ...filters, page: page, limit: pageSize };
    dispatch(getDiscountsFilter(newQuery));
  };

  // SỬA ĐỔI: onFinish (Filter) (thêm filter)
  const onFinish = (values: any) => {
    console.log("Filter values:", values);
    setFilters(values); // <-- Lưu filter
    dispatch(getDiscountsFilter(values));
  };

  // SỬA ĐỔI: onReset (thêm filter)
  const onReset = () => {
    form.resetFields();
    setFilters({}); // <-- Xóa filter
    dispatch(getDiscountsFilter({}));
  };

  // SỬA ĐỔI: Hàm xử lý sửa
  const handleEditDiscount = (id: string) => {
    dispatch(getDiscountById(id));
    setIsModalOpen(true);
  };

  // THÊM VÀO: Hàm mở modal Thêm mới
  const handleOpenAddModal = () => {
    setIsModalOpen(true);
  };

  // ... (const columns giữ nguyên) ...
  // Sửa lỗi nhỏ: thêm ? để tránh lỗi khi value null
  const columns: TableProps<DiscountDataType>["columns"] = [
     {
      title: "Tên mã",
      dataIndex: "name",
      key: "name",
      render: (text) => <a className="font-semibold">{text}</a>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Loại giảm",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (
        <Tag color={type === "ONE_TIME" ? "red" : "green"}>
          {type === "ONE_TIME" ? "Một lần" : "Nhiều lần"}
        </Tag>
      ),
    },
    {
      title: "Giá trị giảm",
      dataIndex: "percent",
      key: "percent",
      render: (value) => <span>{value?.toLocaleString("vi-VN")}%</span>,
    },
    {
      title: "Giá tối thiểu",
      dataIndex: "minPriceToApply",
      key: "minPriceToApply",
      render: (value) => <span>{value?.toLocaleString("vi-VN")}đ</span>,
    },
    // ...
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <span>
          {quantity - (record.maxQuantityCanUse || 0)}/{quantity}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
          <EditOutlined
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => handleEditDiscount(record.discountId)}
          />
      ),
    },
  ];

  // ... (const items giữ nguyên) ...
  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h5 className="font-bold text-sm">Bộ lọc</h5>,
      children: (
        <Form
          form={form}
          onFinish={onFinish}
          initialValues={{
            type: "tat_ca", // Sửa: name="type"
          }}
        >
          {/* ... (các Col, Form.Item) ... */}
          <Row gutter={16}>
             <Col span={8}>
               <Form.Item
                 label="Tên mã"
                 name="discountCode"
                 rules={[{ required: false }]}
               >
                 <Input placeholder="Nhập tên mã giảm giá" />
               </Form.Item>
             </Col>

             <Col span={8}>
               <Form.Item label="Loại giảm" name="type">
                 <Select placeholder="Chọn loại giảm" allowClear>
                   <Select.Option value="tat_ca">Tất cả</Select.Option>
                   <Select.Option value="ONE_TIME">Một lần</Select.Option>
                   <Select.Option value="MANY_TIME">Nhiều lần</Select.Option>
                 </Select>
               </Form.Item>
             </Col>

             <Col span={8}>
               <Form.Item
                 label="Mô tả"
                 name="description"
                 rules={[{ required: false }]}
               >
                 <Input placeholder="Nhập mô tả" />
               </Form.Item>
             </Col>

             <Col span={24}>
               <Form.Item>
                 <div className="flex gap-5">
                   <Button type="primary" htmlType="submit">
                     Tìm kiếm
                   </Button>
                   <Button type="default" onClick={onReset}>
                     Đặt lại
                   </Button>
                 </div>
               </Form.Item>
             </Col>
           </Row>
        </Form>
      ),
    },
  ];


  return (
    <div className="boxpage">
      {contextHolder} {/* Cho thông báo */}
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý mã giảm giá</h5>
        <div>
          {/* SỬA ĐỔI: Thêm onClick */}
          <Button
            type="primary"
            size="middle"
            onClick={handleOpenAddModal}
          >
            Thêm mã giảm giá mới
          </Button>
        </div>
      </div>
      <div className="boxItemPage">
        <Collapse defaultActiveKey={["1"]} ghost items={items} />
      </div>
      <div className="boxItemPage">
        <Table<DiscountDataType>
          columns={columns}
          data={listDiscount}
          rowKey="discountId"
          pagination={{
            // ... (pagination config giữ nguyên) ...
             showQuickJumper: false,
             showSizeChanger: true,
             pageSizeOptions: ["10", "20", "50", "100"],
             current: pagination ? pagination.curPage : 1,
             pageSize: pagination ? pagination.limitPage : 10,
             total: pagination ? pagination.totalRows : (listDiscount?.length ?? 0),
             onChange: (page, pageSize) => {
               handlePageChange(page, pageSize);
             },
          }}
        />
      </div>

      {/* THÊM VÀO: Render Modal */}
      <ModalAddDiscount
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
}