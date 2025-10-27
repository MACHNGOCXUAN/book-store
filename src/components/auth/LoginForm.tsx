// src/components/auth/LoginForm.tsx
"use client";

import React, { useState } from "react";
// Thêm Form.useForm hook
import { Form, Input, Button, Checkbox, Typography, Divider } from "antd";
import { toast } from "react-toastify";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { loginUser, googleLogin } from "../../features/auth/authSlice";
import { GoogleIcon } from "../icons/GoogleIcon";

const { Link: TextLink } = Typography;

/* ===================== Props Types ===================== */
interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToForgotPassword: () => void;
}

/* ===================== Login Form ===================== */
const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToForgotPassword,
}) => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // 1. Lấy instance của form
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoginError(null);
    // 2. Lấy 'remember' từ values
    const { username, password, remember } = values;

    try {
      // Gửi 'remember' (true/false) đến Redux thunk
      await dispatch(loginUser({ username, password, remember })).unwrap();
      toast.success("Đăng nhập thành công!");
      onSuccess(); // đóng modal
      // Delay để đóng modal trước khi reload
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 500);
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

    // 3. Lấy giá trị 'remember' từ form instance cho Google Login
    const remember = form.getFieldValue("remember") || false;

    try {
      // Gửi 'remember' (true/false) đến Redux thunk
      await dispatch(googleLogin({ idToken, remember })).unwrap();
      toast.success("Đăng nhập bằng Google thành công");
      onSuccess();
      // Delay để đóng modal trước khi reload
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 500);
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
    // Gắn form instance vào Form
    <Form
      form={form}
      name="login"
      onFinish={onFinish}
      layout="vertical"
      size="large"
    >
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
        rules={[
          {
            required: true,
            message: "Vui lòng nhập email hoặc số điện thoại!",
          },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Email hoặc Số điện thoại"
        />
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
          {/* Đặt giá trị mặc định cho checkbox là false */}
          <Form.Item
            name="remember"
            valuePropName="checked"
            noStyle
            initialValue={false}
          >
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <TextLink onClick={onSwitchToForgotPassword}>Quên mật khẩu?</TextLink>
        </div>
      </Form.Item>

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

export default LoginForm;
