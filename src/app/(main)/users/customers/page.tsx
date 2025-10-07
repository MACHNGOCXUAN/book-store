"use client";
import {
  Button,
  Col,
  Collapse,
  CollapseProps,
  Form,
  Input,
  Row,
  Select,
  Space,
  TableProps,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getUserCustomerFilter, getUserStaffFilter } from "@/stores/slices/user.slice";
import { Table } from "@/components/table/table";
import { UserDataType } from "@/types/users";


const columns: TableProps<UserDataType>["columns"] = [
  {
    title: "Tên đăng nhập",
    dataIndex: "userName",
    key: "userName",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Họ và tên",
    dataIndex: "fullName",
    key: "fullName",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Số điện thoại",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
  },
  {
    title: "Vài trò",
    dataIndex: "role",
    key: "role",
    render: (role) => (
      <Tag color={role === "STAFF" ? "blue" : "green"}>
        {role === "STAFF" ? "Nhân viên" : "Khách hàng"}
      </Tag>
    ),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 200,
    render: (status) => (
      <Tag color={status === true ? "green" : "volcano"}>
        {status === true ? "Hoạt động" : "Không hoạt động"}
      </Tag>
    ),
  },
  {
    title: "Địa chỉ",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Ngày sinh",
    dataIndex: "dateOfBirth",
    key: "dateOfBirth",
  },
  {
    title: "Điểm tích lũy",
    dataIndex: "loyaltyPoints",
    key: "loyaltyPoints",
  },
  {
    title: "Thao tác",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        {record.status === true ? (
          <LockOutlined
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => console.log("Lock user:", record.userId)}
          />
        ) : (
          <UnlockOutlined
            style={{ color: "green", cursor: "pointer" }}
            onClick={() => console.log("Unlock user:", record.userId)}
          />
        )}
        <Button
          style={{ color: "white", background: "red", outline: "none" }}
          icon={<DeleteOutlined />}
        />
      </Space>
    ),
  },
];

export default function UserPage() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { listCustomer, pagination } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(getUserCustomerFilter({}));
  }, [dispatch]);

  const handlePageChange = (page: number, pageSize: number) => {
    dispatch(getUserCustomerFilter({ page: page, limit: pageSize }));
  };

  const onFinish = (values: any) => {
    console.log("Finish:", values);
  };

  const onReset = () => {
    form.resetFields();
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h5 className="font-bold text-sm">Bộ lọc</h5>,
      children: (
        <Form form={form} onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tên người dùng"
                name="tenNguoiDung"
                rules={[{ required: false }]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Trạng thái" name="trangThai">
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  defaultValue={"tat_ca"}
                >
                  <Select.Option value="tat_ca">Tất cả</Select.Option>
                  <Select.Option value="hoat_dong">Hoạt động</Select.Option>
                  <Select.Option value="khong_hoat_dong">
                    Không hoạt động
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
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
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý người dùng</h5>
        <div>
          <Button type="primary" size="middle">
            Thêm người dùng mới
          </Button>
        </div>
      </div>
      <div className="boxItemPage">
        <Collapse defaultActiveKey={["1"]} ghost items={items} />
      </div>
      <div className="boxItemPage">
        <Table<UserDataType>
          columns={columns}
          data={listCustomer}
          pagination={{
            showQuickJumper: false,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            current: pagination ? pagination.curPage : 1,
            pageSize: pagination ? pagination.limitPage : 10,
            total: pagination ? pagination.totalRows : listCustomer.length,
            onChange: (page, pageSize) => {
              handlePageChange(page, pageSize);
            },
          }}
        />
      </div>
    </div>
  );
}
