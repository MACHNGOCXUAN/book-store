"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Switch,
  Button,
  notification,
} from "antd";
import type { UserDataType } from "@/types/users"; // import model của bạn
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  createStaff,
  getUserStaffFilter,
  resetMessage,
  updateStaff,
} from "@/stores/slices/user.slice";

const { Option } = Select;

interface ModelAddUserProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  mode?: "add" | "edit";
}

const ModelAddUser = ({
  isModalOpen,
  setIsModalOpen,
  mode,
}: ModelAddUserProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<UserDataType>();
  const { loading, message, staff } = useAppSelector((state) => state.user);

  const title =
    mode === "add" ? (
      <h3 className="font-semibold text-lg">Thêm người dùng mới</h3>
    ) : (
      <h3 className="font-semibold text-lg">Chỉnh sửa người dùng</h3>
    );

  const onFinish = (values: UserDataType) => {
    let payload = { ...values };
    if (staff?.userId && !values.password) {
      delete payload.password;
      dispatch(updateStaff({ id: staff.userId, ...payload }));
    } else if (staff?.userId) {
      dispatch(updateStaff({ id: staff.userId, ...payload }));
    } else {
      dispatch(createStaff(payload));
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (message && message?.type === "success") {
      dispatch(getUserStaffFilter({}));
      setIsModalOpen(false);
      dispatch(resetMessage());
    }
  }, [dispatch, message]);

  console.log("xuanjhnjknk: ", staff);
  

  useEffect(() => {
    if (isModalOpen) {
      if (staff) {
        form.setFieldsValue(staff);
      } else {
        form.resetFields();
      }
    }
  }, [staff, form, isModalOpen]);

  return (
    <Modal
      title={title}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={900}
      style={{ zIndex: 200000000 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 10 }}
        initialValues={{
          status: true,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={
                staff
                  ? [
                      {
                        min: 6,
                        message:
                          "Mật khẩu phải có ít nhất 6 ký tự nếu muốn thay đổi!",
                      },
                    ]
                  : [
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                    ]
              }
            >
              <Input.Password
                placeholder={
                  staff
                    ? "Để trống nếu không muốn đổi mật khẩu"
                    : "Nhập mật khẩu"
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select placeholder="Chọn giới tính" allowClear>
                <Select.Option value="MALE">Nam</Select.Option>
                <Select.Option value="FEMALE">Nữ</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <Input type="date" placeholder="Chọn ngày sinh" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phòng ban" name="department">
              <Input placeholder="Nhập phòng ban (nếu có)" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Ca làm" name="shift">
              <Input placeholder="Nhập ca làm (ví dụ: sáng, chiều...)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Trạng thái" name="status" valuePropName="checked">
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-3 mt-5">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu người dùng
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModelAddUser;
