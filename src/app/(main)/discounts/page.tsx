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
} from "antd";
import { useEffect, useState } from "react"; // THAY ĐỔI: Bỏ useState của pagination
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Table } from "@/components/table/table";

// THÊM VÀO: Imports cho Redux và Thông báo (giống UserPage)
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { useMyNotification } from "@/hooks/notification";
import {
  deleteDiscount,
  getDiscountsFilter,
  resetMessage,
} from "@/stores/slices/discount.slice"; // THÊM VÀO: Import actions mới

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
  
  // THÊM VÀO: Kết nối Redux và Thông báo
  const dispatch = useAppDispatch();
  const { listDiscount, pagination, message } = useAppSelector(
    (state: any) => state.discount // "discount" là tên slice trong store
  );
  const { openNotification, contextHolder } = useMyNotification();

  // THAY ĐỔI: Bỏ mockDiscounts và pagination state
  // const [pagination, setPagination] = useState(...)
  // const mockDiscounts = [...]

  // THÊM VÀO: Lấy dữ liệu khi component được load
  useEffect(() => {
    dispatch(getDiscountsFilter({}));
    console.log("Dispatch getDiscountsFilter", dispatch);
  }, [dispatch]);

  // THÊM VÀO: Xử lý thông báo (giống hệt UserPage)
  useEffect(() => {
    if (message) {
      if (message.type == "success") {
        openNotification("success", message?.message);
      } else {
        openNotification("error", message?.message);
      }
      // Load lại dữ liệu sau khi Xóa, Sửa, Thêm thành công
      dispatch(getDiscountsFilter({}));
    }
    dispatch(resetMessage());
  }, [message]);

  useEffect(() => {
    console.log("List discount in component:", listDiscount);
  }, [listDiscount]);
  
  // THAY ĐỔI: handlePageChange
  const handlePageChange = (page: number, pageSize: number) => {
    dispatch(getDiscountsFilter({ page: page, limit: pageSize }));
  };

  // THAY ĐỔI: onFinish (Filter)
  const onFinish = (values: any) => {
    console.log("Filter values:", values);
    dispatch(getDiscountsFilter(values)); // Gửi filter lên
  };

  // THAY ĐỔI: onReset
  const onReset = () => {
    form.resetFields();
    dispatch(getDiscountsFilter({})); // Reset về trang đầu
  };
  
  // THÊM VÀO: Hàm xử lý xóa
  const handleDeleteDiscount = (id: string) => {
    // Bạn có thể thêm Modal confirm ở đây
    dispatch(deleteDiscount(id));
  };
  
  // THÊM VÀO: Hàm xử lý sửa
  const handleEditDiscount = (id: string) => {
    console.log("Edit:", id);
    // Logic mở Modal Edit và dispatch(getDiscountById(id)) ở đây
  };

  const columns: TableProps<DiscountDataType>["columns"] = [
    // ... (Các cột khác giữ nguyên) ...
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
      render: (value) => <span>{value.toLocaleString("vi-VN")}%</span>,
    },
    {
      title: "Giá tối thiểu",
      dataIndex: "minPriceToApply",
      key: "minPriceToApply",
      render: (value) => <span>{value.toLocaleString("vi-VN")}đ</span>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <span>
          {quantity - record.maxQuantityCanUse}/{quantity}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <EditOutlined
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => handleEditDiscount(record.discountId)} // THAY ĐỔI
          />
          <Button
            style={{ color: "white", background: "red", outline: "none" }}
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDiscount(record.discountId)} // THAY ĐỔI
          />
        </Space>
      ),
    },
  ];

  const items: CollapseProps["items"] = [
    // ... (Phần Collapse bộ lọc giữ nguyên) ...
    {
      key: "1",
      label: <h5 className="font-bold text-sm">Bộ lọc</h5>,
      children: (
        <Form
          form={form}
          onFinish={onFinish}
          initialValues={{
            discountType: "tat_ca",
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tên mã"
                name="name"
                rules={[{ required: false }]}
              >
                <Input placeholder="Nhập tên mã giảm giá" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Loại giảm" name="discountType">
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
      {contextHolder} {/* THÊM VÀO: Cho thông báo */}
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý mã giảm giá</h5>
        <div>
          <Button type="primary" size="middle">
            Thêm mã giảm giá mới
            {/* Logic mở Modal Thêm mới ở đây */}
          </Button>
        </div>
      </div>
      <div className="boxItemPage">
        <Collapse defaultActiveKey={["1"]} ghost items={items} />
      </div>
      <div className="boxItemPage">
        <Table<DiscountDataType>
          columns={columns}
          data={listDiscount} // THAY ĐỔI: Dùng data từ Redux
          rowKey="discountId"
          pagination={{
            showQuickJumper: false,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            // THAY ĐỔI: Dùng pagination từ Redux
            current: pagination ? pagination.curPage : 1,
            pageSize: pagination ? pagination.limitPage : 10,
            total: pagination ? pagination.totalRows : (listDiscount?.length ?? 0),
            onChange: (page, pageSize) => {
              handlePageChange(page, pageSize);
            },
          }}
        />
      </div>
    </div>
  );
}