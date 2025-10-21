// src/components/AuthModal.tsx
"use client";

import React, { useState } from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Divider,
} from "antd";
import { toast } from 'react-toastify';
import type { TabsProps } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";
import { useAppDispatch } from "../store/hooks";
import { loginUser, registerUser, googleLogin } from "../features/auth/authSlice";
import { GoogleIcon } from "../components/icons/GoogleIcon";

const { Title, Text, Link: TextLink } = Typography;

/* ===================== Props Types ===================== */
interface LoginFormProps {
  onSuccess: () => void;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface AuthModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

/* ===================== Login Form ===================== */
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const onFinish = async (values: any) => {
    setLoginError(null);
    const username = values.username;
    const password = values.password;

    try {
      await dispatch(loginUser({ username, password })).unwrap();
      toast.success("Đăng nhập thành công!");
      onSuccess(); // đóng modal (Header tự cập nhật qua Redux)
    } catch (err: any) {
      const msg = err || "Đăng nhập thất bại";
      setLoginError(msg.toString());
    }
  };

  /* ---------- Google Sign-In Handler ---------- */
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoginError(null);
    
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setLoginError("Google sign-in failed: no credential returned");
      return;
    }

    try {
      await dispatch(googleLogin({ idToken })).unwrap();
      toast.success("Đăng nhập bằng Google thành công");
      onSuccess();
    } catch (e: any) {
      const errorMsg = e || "Google đăng nhập thất bại";
      setLoginError(errorMsg.toString());
      toast.error(errorMsg.toString());
    }
  };

  const handleGoogleError = () => {
    setLoginError("Google sign-in failed");
    toast.error("Google sign-in failed");
  };

  return (
    <Form name="login" onFinish={onFinish} layout="vertical" size="large">
      {loginError && (
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
            {loginError}
          </div>
        </Form.Item>
      )}

      <Form.Item
        name="username"
        rules={[{ required: true, message: "Vui lòng nhập email hoặc số điện thoại!" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Email hoặc Số điện thoại" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
      </Form.Item>

      <Form.Item>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <TextLink href="#">Quên mật khẩu?</TextLink>
        </div>
      </Form.Item>

      {/* Nút Đăng nhập thường */}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          style={{
            height: 48,
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Đăng nhập
        </Button>
      </Form.Item>

      <Divider>Hoặc đăng nhập bằng</Divider>

      <Form.Item style={{ marginBottom: 0, padding: 0 }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Button
            block
            icon={<GoogleIcon />}
            style={{
              height: 48,
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#fff",
              borderColor: "#d9d9d9",
            }}
          >
            Đăng nhập bằng Google
          </Button>

          {/* GoogleLogin ẩn */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              pointerEvents: "auto",
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="continue_with"
              size="large"
            />
          </div>
        </div>
      </Form.Item>



    </Form>
  );
};

/* ===================== Register Form ===================== */
const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [regError, setRegError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    const { fullName, email, phone, password } = values;
    setRegError(null);
    try {
      await dispatch(registerUser({ fullName, email, phone, password })).unwrap();
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      form.resetFields();
      onSwitchToLogin();
    } catch (err: any) {
      const msg = err || "Đăng ký thất bại";
      setRegError(msg.toString());
    }
  };

  return (
    <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
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
      <Form.Item name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không đúng định dạng!" },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="phone"
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) return Promise.resolve();
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );
};

/* ===================== Auth Modal ===================== */
const AuthModal: React.FC<AuthModalProps> = ({ open, onCancel, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("login");

  const items: TabsProps["items"] = [
    { key: "login", label: "Đăng nhập", children: <LoginForm onSuccess={onSuccess} /> },
    { key: "register", label: "Đăng ký", children: <RegisterForm onSwitchToLogin={() => setActiveTab("login")} /> },
  ];

  const modalTitle = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Title level={3} style={{ textAlign: "center", margin: 0 }}>
        Chào mừng bạn
      </Title>
      <Text type="secondary">Đăng nhập hoặc đăng ký để tiếp tục</Text>
    </div>
  );

  return (
    <Modal open={open} onCancel={onCancel} title={modalTitle} footer={null} centered width={420}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} centered />
    </Modal>
  );
};

export default AuthModal;
