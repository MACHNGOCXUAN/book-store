"use client";
import {
  Button,
  Col,
  Collapse,
  CollapseProps,
  Form,
  Input,
  notification,
  Row,
  Select,
  Space,
  TableProps,
  Tag,
} from "antd";
import React, { use, useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { deleteStaff, getStaffById, getUserStaffFilter, resetMessage, updateStatusStaff } from "@/stores/slices/user.slice";
import { Table } from "@/components/table/table";
import { UserDataType } from "@/types/users";
import ModelAddUser from "@/components/Model/model-add-user";
import { useMyNotification } from "@/hooks/notification";

export default function StaffPage() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { listStaff, pagination, message } = useAppSelector(
    (state) => state.user
  );
  const { openNotification, contextHolder } = useMyNotification();


  useEffect(() => {
    dispatch(getUserStaffFilter({}));
  }, [dispatch]);

  useEffect(() => {
    if(message) {
      openNotification("success", message?.message)
    }
    dispatch(resetMessage())
  }, [message])

  const handlePageChange = (page: number, pageSize: number) => {
    dispatch(getUserStaffFilter({ page: page, limit: pageSize }));
  };

  const onFinish = (values: any) => {
    dispatch(getUserStaffFilter(values));
  };

  const onReset = () => {
    form.resetFields();
    dispatch(getUserStaffFilter({}));
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h5 className="font-bold text-sm">Bộ lọc</h5>,
      children: (
        <Form
          form={form}
          onFinish={onFinish}
          initialValues={{
            status: "tat_ca",
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tên người dùng"
                name="name"
                rules={[{ required: false }]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Trạng thái" name="status">
                <Select placeholder="Chọn trạng thái" allowClear>
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

  const handleOpenModelEdit = (id: string) => {
    dispatch(getStaffById(id));
    setIsModalOpen(true);
  };

  const handleUnLockAccount = (id: string) => {
    dispatch(updateStatusStaff({
      userId: id,
      status: false
    }))
  }

  const handleLockAccount = (id: string) => {
    dispatch(updateStatusStaff({
      userId: id,
      status: true
    }))
  }

  const handleDeleteStaff = (id: string) => {
    dispatch(deleteStaff(id));
  }

  const columns: TableProps<UserDataType>["columns"] = [
    {
      title: "Họ và tên",
      dataIndex: "userName",
      key: "userName",
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
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Ca làm",
      dataIndex: "shift",
      key: "shift",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === true ? (
            <UnlockOutlined
              style={{ color: "green", cursor: "pointer" }}
              onClick={() => handleUnLockAccount(record.userId)}
            />
          ) : (
            
            <LockOutlined
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => handleLockAccount(record.userId)}
            />
          )}
          <Button
            style={{ color: "white", background: "red", outline: "none" }}
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStaff(record.userId)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleOpenModelEdit(record.userId)}
          />
        </Space>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handerOpenStaff = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="boxpage">
      {contextHolder}
      <div className="boxItemPage flex justify-between items-center">
        <h5 className="font-bold text-sm">Quản lý người dùng</h5>
        <div>
          <Button type="primary" size="middle" onClick={handerOpenStaff}>
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
          data={listStaff}
          rowKey="userId"
          pagination={{
            showQuickJumper: false,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            current: pagination ? pagination.curPage : 1,
            pageSize: pagination ? pagination.limitPage : 10,
            total: pagination ? pagination.totalRows : listStaff.length,
            onChange: (page, pageSize) => {
              handlePageChange(page, pageSize);
            },
          }}
        />
      </div>

      <ModelAddUser isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
}
