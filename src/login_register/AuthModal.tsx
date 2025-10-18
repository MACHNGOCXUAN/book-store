// src/components/AuthModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  message,
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
import { GoogleIcon } from "../components/icons/GoogleIcon";
import { useAppDispatch } from "../store/hooks";
import { setAuth } from "../features/auth/authSlice";

const { Title, Text, Link: TextLink } = Typography;

/* ===================== Types ===================== */
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
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
  const [pastedToken, setPastedToken] = useState("");
  const dispatch = useAppDispatch();

  const onFinish = async (values: any) => {
    setLoginError(null);
    const username = values.username;
    const password = values.password;

    try {
      const { login, getProfile } = await import("../lib/api");

      // 1) Gọi API lấy token
      const res: any = await login(username, password);
      if (!res?.access_token) {
        setLoginError("Đăng nhập thất bại: không nhận được token");
        return;
      }
      const token: string = res.access_token;

      // 2) Lưu token vào Redux (và localStorage qua reducer)
      dispatch(setAuth({ token }));

      // 3) Lấy profile (getProfile nên đọc từ localStorage hoặc bạn truyền header)
      try {
        const user: any = await getProfile();
        const u = {
          userId: user?.userId,
          userName: user?.userName,
          fullName: user?.fullName,
          email: user?.email,
        };
        // 4) Cập nhật lại Redux kèm user
        dispatch(setAuth({ token, user: u }));
      } catch {
        // Nếu server chưa sẵn profile, vẫn chấp nhận login với token
      }

  toast.success("Đăng nhập thành công!");
  onSuccess(); // đóng modal (Header tự cập nhật qua Redux)
    } catch (err: any) {
      const msg = err?.message || "Đăng nhập thất bại";
      setLoginError(msg.toString());
    }
  };

  /* ---------- Google Sign-In ---------- */
  const handleGoogleLogin = () => {
    const clientId =
      (window as any).__GOOGLE_CLIENT_ID ||
      (window as any).__REACT_APP_GOOGLE_CLIENT_ID ||
      undefined;

    if (!clientId) {
      setIsTokenModalVisible(true); // Dev fallback: dán id_token
      return;
    }

    try {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt();
        return;
      }
    } catch {
      /* ignore */
    }
    message.info("Vui lòng dùng nút Google xuất hiện trên form.");
  };

  const handleCredentialResponse = async (response: any) => {
    const idToken = response?.credential;
    if (!idToken) {
      setLoginError("Google sign-in failed: no credential returned");
      return;
    }

    try {
      const { getProfile } = await import("../lib/api");

      const r = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || "Google login failed");
      }

      const res: any = await r.json();
      if (!res?.access_token) {
        setLoginError("Google đăng nhập thất bại: không nhận token từ server");
        return;
      }

      const token = res.access_token;
      dispatch(setAuth({ token }));

      try {
        const user: any = await getProfile();
        const u = {
          userId: user?.userId,
          userName: user?.userName,
          fullName: user?.fullName,
          email: user?.email,
        };
        dispatch(setAuth({ token, user: u }));
      } catch {
        /* ignore profile error */
      }

  toast.success("Đăng nhập bằng Google thành công");
  onSuccess();
    } catch (e: any) {
      setLoginError(e?.message || "Google đăng nhập thất bại");
    }
  };

  // Khởi tạo Google Identity khi có clientId và element sẵn sàng
  useEffect(() => {
    const clientId =
      (window as any).__GOOGLE_CLIENT_ID ||
      (window as any).__REACT_APP_GOOGLE_CLIENT_ID ||
      undefined;
    if (!clientId) return;

    const initializeGSI = () => {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });
        const target = document.getElementById("google-signin-button");
        if (target) {
          (window as any).google.accounts.id.renderButton(target, {
            theme: "outline",
            size: "large",
            width: "350",
          });
          // (window as any).google.accounts.id.prompt(); // tuỳ bạn muốn auto prompt hay không
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Google identity init failed", e);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initializeGSI();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGSI;
      document.head.appendChild(script);
    }
  }, []);

  // Dev fallback: dán id_token thủ công
  const handlePasteTokenOk = async () => {
    setIsTokenModalVisible(false);
    if (!pastedToken) return;

    try {
      const r = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: pastedToken }),
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || "Google login failed");
      }

      const res: any = await r.json();
      if (!res?.access_token) {
        setLoginError("Google đăng nhập thất bại: không nhận token từ server");
        return;
      }

      const token = res.access_token;
      dispatch(setAuth({ token }));

      const { getProfile } = await import("../lib/api");
      try {
        const user: any = await getProfile();
        const u = {
          userId: user?.userId,
          userName: user?.userName,
          fullName: user?.fullName,
          email: user?.email,
        };
        dispatch(setAuth({ token, user: u }));
      } catch {
        /* ignore */
      }

  toast.success("Đăng nhập Google (dev) thành công");
  onSuccess();
    } catch (e: any) {
      setLoginError(e?.message || "Google đăng nhập thất bại");
    }
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

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Đăng nhập
        </Button>
      </Form.Item>

      <Divider>Hoặc</Divider>

      <Form.Item>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div id="google-signin-button" style={{ marginBottom: 12 }} />
          <Button block icon={<GoogleIcon />} size="large" onClick={handleGoogleLogin}>
            Đăng nhập bằng tài khoản Google
          </Button>
        </div>
      </Form.Item>

      {/* Dev modal dán id_token */}
      <Modal
        title="Dán Google ID token"
        open={isTokenModalVisible}
        onOk={handlePasteTokenOk}
        onCancel={() => setIsTokenModalVisible(false)}
        okText="Gửi"
      >
        <Input.TextArea
          rows={4}
          value={pastedToken}
          onChange={(e) => setPastedToken(e.target.value)}
          placeholder="Dán id_token ở đây"
        />
      </Modal>
    </Form>
  );
};

/* ===================== Register Form ===================== */
const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const { fullName, email, phone, password, address, dateOfBirth } = values;
    try {
      const apiModule = await import("../lib/api");
      const api = (apiModule as any).default || apiModule;
      let dobStr: string | undefined = undefined;
      if (dateOfBirth) {
        // dateOfBirth may be a Dayjs/moment object (if using DatePicker) or a string from <input type="date" />
        if (typeof dateOfBirth === 'string') dobStr = dateOfBirth;
        else if (typeof (dateOfBirth as any).format === 'function') dobStr = (dateOfBirth as any).format('YYYY-MM-DD');
      }
      await api.register(fullName, email, phone, password, address, dobStr);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      form.resetFields();
      onSwitchToLogin();
    } catch (err: any) {
      message.error(err?.message || "Đăng ký thất bại");
    }
  };

  return (
    <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
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
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
      </Form.Item>

      <Form.Item name="address">
        <Input prefix={<UserOutlined />} placeholder="Địa chỉ (ví dụ: Ho Chi Minh City)" />
      </Form.Item>

      <Form.Item name="dateOfBirth">
        {/* Using antd DatePicker for DOB */}
        {/* Import DatePicker at top of file if not already present */}
        <Input type="date" />
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
