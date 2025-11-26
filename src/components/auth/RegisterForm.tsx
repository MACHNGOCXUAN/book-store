// src/components/auth/RegisterForm.tsx
"use client";

import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { registerUser } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../store/hooks";
import {
  confirmPasswordValidationRules,
  emailValidationRulesBuiltIn,
  fullNameValidationRules,
  passwordValidationRules,
  phoneValidationRules,
} from "../../utils/validation";

/* ===================== Props Types ===================== */
interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

/* ===================== Register Form ===================== */
const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [regError, setRegError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    const { fullName, email, phone, password } = values;
    setRegError(null);
    try {
      await dispatch(
        registerUser({ fullName, email, phone, password })
      ).unwrap();
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      form.resetFields();
      onSwitchToLogin();
    } catch (err: any) {
      const msg = err || "Đăng ký thất bại";
      setRegError(msg.toString());
    }
  };

  return (
    <Form
      form={form}
      name="register"
      onFinish={onFinish}
      layout="vertical"
      size="large"
    >
      {regError && (
        <Form.Item>
          <div
            style={{
              color: "#f5222d",
              background: "#fff1f0",
              padding: 12,
              borderRadius: 6,
              textAlign: "center",
            }}
          >
            {regError}
          </div>
        </Form.Item>
      )}
      <Form.Item
        name="fullName"
        rules={fullNameValidationRules}
      >
        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={emailValidationRulesBuiltIn}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="phone"
        rules={phoneValidationRules}
      >
        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={passwordValidationRules}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={["password"]}
        rules={confirmPasswordValidationRules}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Xác nhận mật khẩu"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;
