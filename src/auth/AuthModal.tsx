// components/AuthModal.tsx

"use client"

import React, { useState, useEffect } from "react";
import { Modal, Tabs, Form, Input, Button, Checkbox, Typography, message, Divider } from "antd";
import type { TabsProps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { GoogleIcon } from "../components/icons/GoogleIcon";

const { Title, Text, Link } = Typography;

// Định nghĩa props cho các form nội bộ
interface LoginFormProps {
  onSuccess: () => void;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

// Định nghĩa props cho component chính
interface AuthModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}


// --- Login Form Component ---
import { useAppDispatch } from '../store/hooks';
import { setAuth } from '../features/auth/authSlice';

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
  const [pastedToken, setPastedToken] = useState("");
  const dispatch = useAppDispatch();

  const onFinish = (values: any) => {
    setLoginError(null);
    const username = values.username;
    const password = values.password;
    import("../lib/api").then(({ login, getProfile }) => {
      login(username, password)
        .then((res: any) => {
          if (res?.access_token) {
            const token = res.access_token;
            // try to fetch profile and store in redux
            getProfile()
              .then((user: any) => {
                const u = { userId: user?.userId, userName: user?.userName, fullName: user?.fullName, email: user?.email };
                try { dispatch(setAuth({ token, user: u })); } catch (e) { try { localStorage.setItem('access_token', token); if (u.fullName) localStorage.setItem('user_fullName', u.fullName); } catch {} }
                message.success("Đăng nhập thành công!");
                onSuccess();
              })
              .catch(() => {
                try { dispatch(setAuth({ token } as any)); } catch (e) { try { localStorage.setItem('access_token', token); } catch {} }
                message.success("Đăng nhập thành công!");
                onSuccess();
              });
          } else {
            setLoginError("Đăng nhập thất bại: không nhận được token");
          }
        })
        .catch((err: any) => {
          const msg = err?.message || "Đăng nhập thất bại";
          setLoginError(msg.toString());
        });
    });
  };

  const handleGoogleLogin = () => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID || (window as any).__REACT_APP_GOOGLE_CLIENT_ID || undefined;
    if (!clientId) {
      setIsTokenModalVisible(true);
      return;
    }
    try {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt();
        return;
      }
    } catch (e) {}
    message.info("Vui lòng sử dụng nút Google hiện trên form để tiếp tục.");
  };

  function handleCredentialResponse(response: any) {
    const idToken = response?.credential;
    if (!idToken) {
      setLoginError('Google sign-in failed: no credential returned');
      return;
    }
    import('../lib/api').then(({ getProfile }) => {
      fetch('http://localhost:8080/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || 'Google login failed') }))
        .then((res: any) => {
          if (res?.access_token) {
            const token = res.access_token;
            try {
              // fetch profile and set redux
              getProfile().then((user: any) => {
                const u = { userId: user?.userId, userName: user?.userName, fullName: user?.fullName, email: user?.email };
                try { dispatch(setAuth({ token, user: u })); } catch (e) { try { localStorage.setItem('access_token', token); if (u.fullName) localStorage.setItem('user_fullName', u.fullName); } catch {} }
                message.success('Đăng nhập bằng Google thành công');
                onSuccess();
              }).catch(() => { try { dispatch(setAuth({ token } as any)); } catch (e) { try { localStorage.setItem('access_token', token); } catch {} } onSuccess(); });
            } catch (e) {
              try { localStorage.setItem('access_token', token); } catch (e) {}
              onSuccess();
            }
          } else {
            setLoginError('Google đăng nhập thất bại: không nhận token từ server');
          }
        }).catch((err: any) => {
          setLoginError(err?.message || 'Google đăng nhập thất bại');
        });
    });
  }

  useEffect(() => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID || (window as any).__REACT_APP_GOOGLE_CLIENT_ID || undefined;
    if (!clientId) return;
    try { (window as any).__GOOGLE_CLIENT_ID = clientId; } catch (e) {}
    
    const initializeGSI = () => {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', width: '350' }
        );
        (window as any).google.accounts.id.prompt();
      } catch (e) {
        console.error('Google identity init failed', e);
      }
    };

    if (document.getElementById('google-signin-button')) {
        if ((window as any).google?.accounts?.id) {
            initializeGSI();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGSI;
            document.head.appendChild(script);
        }
    }
  }, []);

  const handlePasteTokenOk = () => {
    setIsTokenModalVisible(false);
    if (!pastedToken) return;
    fetch('http://localhost:8080/api/auth/google', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: pastedToken })
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || 'Google login failed') }))
      .then((res: any) => {
        if (res?.access_token) {
          const token = res.access_token;
          import('../lib/api').then(({ getProfile }) => {
            getProfile().then((user: any) => {
              const u = { userId: user?.userId, userName: user?.userName, fullName: user?.fullName, email: user?.email };
              try { dispatch(setAuth({ token, user: u })); } catch (e) { try { localStorage.setItem('access_token', token); if (u.fullName) localStorage.setItem('user_fullName', u.fullName); } catch {} }
              onSuccess();
            }).catch(() => { try { dispatch(setAuth({ token } as any)); } catch (e) { try { localStorage.setItem('access_token', token); } catch {} } onSuccess(); });
          });
        } else {
          setLoginError('Google đăng nhập thất bại: không nhận token từ server');
        }
      }).catch((err: any) => setLoginError(err?.message || 'Google đăng nhập thất bại'));
  };

  return (
    <Form name="login" onFinish={onFinish} layout="vertical" size="large">
      {loginError && (
        <Form.Item>
          <div style={{ color: '#f5222d', background: '#fff1f0', padding: 12, borderRadius: 6, textAlign: 'center' }}>
            {loginError}
          </div>
        </Form.Item>
      )}
      <Form.Item name="username" rules={[{ required: true, message: "Vui lòng nhập email hoặc số điện thoại!" }]}>
        <Input prefix={<UserOutlined />} placeholder="Email hoặc Số điện thoại" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
      </Form.Item>
      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Form.Item name="remember" valuePropName="checked" noStyle><Checkbox>Ghi nhớ đăng nhập</Checkbox></Form.Item>
          <Link href="#">Quên mật khẩu?</Link>
        </div>
      </Form.Item>
      <Form.Item><Button type="primary" htmlType="submit" block>Đăng nhập</Button></Form.Item>
      <Divider>Hoặc</Divider>
      <Form.Item>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div id="google-signin-button" style={{ marginBottom: 12 }} />
          <Button block icon={<GoogleIcon />} size="large" onClick={handleGoogleLogin}>
            Đăng nhập bằng tài khoản Google
          </Button>
        </div>
      </Form.Item>
      <Modal title="Dán Google ID token" open={isTokenModalVisible} onOk={handlePasteTokenOk} onCancel={() => setIsTokenModalVisible(false)} okText="Gửi">
        <Input.TextArea rows={4} value={pastedToken} onChange={(e) => setPastedToken(e.target.value)} placeholder="Dán id_token ở đây" />
      </Modal>
    </Form>
  );
};


// --- Register Form Component ---
const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const onFinish = (values: any) => {
    const { fullName, email, phone, password } = values;
    import("../lib/api").then(({ default: api }) => {
      api.register(fullName, email, phone, password)
        .then((_res: any) => {
          message.success("Đăng ký thành công! Vui lòng đăng nhập.");
          try { form.resetFields(); } catch (e) {}
          try { onSwitchToLogin(); } catch (e) {}
        })
        .catch((err: any) => {
          message.error(err.message || "Đăng ký thất bại");
        });
    });
  };

  return (
    <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
      <Form.Item name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
      </Form.Item>
      <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: 'email', message: 'Email không đúng định dạng!' }]}>
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
      </Form.Item>
      <Form.Item name="confirmPassword" dependencies={['password']} rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error("Mật khẩu xác nhận không khớp!")); }, }),]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
      </Form.Item>
      <Form.Item><Button type="primary" htmlType="submit" block>Đăng ký</Button></Form.Item>
    </Form>
  );
};


// --- Main Auth Modal Component ---
const AuthModal: React.FC<AuthModalProps> = ({ open, onCancel, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');

  const items: TabsProps['items'] = [
    {
      key: 'login',
      label: 'Đăng nhập',
      children: <LoginForm onSuccess={onSuccess} />,
    },
    {
      key: 'register',
      label: 'Đăng ký',
      children: <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />,
    },
  ];

  const modalTitle = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Title level={3} style={{ textAlign: "center", margin: 0 }}>Chào mừng bạn</Title>
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