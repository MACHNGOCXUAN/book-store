// pages/auth.tsx

"use client"

import React from "react"
import { Card, Tabs, Form, Input, Button, Checkbox, Typography, message, Divider } from "antd"
import type { TabsProps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { GoogleIcon } from "../components/icons/GoogleIcon";
import { Modal } from 'antd';

const { Title, Text, Link } = Typography;

// --- Login Form Component ---
const LoginForm = () => {
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const onFinish = (values: any) => {
    setLoginError(null);
    const username = values.username;
    const password = values.password;
    // backend admin login expects phone + password; we pass username as phone
    import("../lib/api").then(({ login, getProfile }) => {
      login(username, password)
        .then((res: any) => {
          if (res?.access_token) {
            try {
              localStorage.setItem("access_token", res.access_token);
            } catch (e) {}
            // try to fetch profile to get fullName, store it
            getProfile()
              .then((user: any) => {
                try {
                  const name = user?.fullName || user?.userName || "";
                  if (name) localStorage.setItem("user_fullName", name);
                } catch (e) {}
                message.success("Đăng nhập thành công!");
                window.location.href = "/";
              })
              .catch(() => {
                message.success("Đăng nhập thành công!");
                window.location.href = "/";
              });
          } else {
            setLoginError("Đăng nhập thất bại: không nhận được token");
          }
        })
        .catch((err: any) => {
          // show specific backend message when possible
          const msg = err?.message || "Đăng nhập thất bại";
          setLoginError(msg.toString());
        });
    });
  };
  // Hàm xử lý khi nhấn nút Đăng nhập bằng Google
  const handleGoogleLogin = () => {
    // if google client id available use the identity services button (button is rendered automatically)
    const clientId = (window as any).__GOOGLE_CLIENT_ID || (window as any).__REACT_APP_GOOGLE_CLIENT_ID || undefined;
    if (!clientId) {
      // open modal to paste id token
      setIsTokenModalVisible(true);
      return;
    }
      // if google identity available, trigger prompt to let user choose account (One Tap / chooser)
      try {
        if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.id) {
          (window as any).google.accounts.id.prompt();
          return;
        }
      } catch (e) {}
    message.info("Vui lòng sử dụng nút Google hiện trên form để tiếp tục.");
  };

  const [isTokenModalVisible, setIsTokenModalVisible] = React.useState(false);
  const [pastedToken, setPastedToken] = React.useState("");

  // load google identity script and render button if client id provided
  React.useEffect(() => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID || (window as any).__REACT_APP_GOOGLE_CLIENT_ID || undefined;
    if (!clientId) return;

    // expose clientId so handler can access
    try { (window as any).__GOOGLE_CLIENT_ID = clientId; } catch (e) {}

    if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.id) {
      // already initialized
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large' }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large' }
        );
          // prompt One Tap automatically (will show if eligible)
          try { (window as any).google.accounts.id.prompt(); } catch (e) {}
      } catch (e) {
        console.error('Google identity init failed', e);
      }
    };
    document.head.appendChild(script);
    return () => { /* leave script loaded */ };
  }, []);

  function handleCredentialResponse(response: any) {
    const idToken = response?.credential;
    if (!idToken) {
      setLoginError('Google sign-in failed: no credential returned');
      return;
    }
    // send idToken to backend
  import('../lib/api').then(({ getProfile }) => {
      fetch('http://localhost:8080/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || 'Google login failed') }))
        .then((res: any) => {
          if (res?.access_token) {
            try { localStorage.setItem('access_token', res.access_token); } catch (e) {}
            // fetch profile
            getProfile().then((user: any) => {
              try { if (user?.fullName) localStorage.setItem('user_fullName', user.fullName); } catch (e) {}
              message.success('Đăng nhập bằng Google thành công');
              window.location.href = '/';
            }).catch(() => { window.location.href = '/'; });
          } else {
            setLoginError('Google đăng nhập thất bại: không nhận token từ server');
          }
        }).catch((err: any) => {
          setLoginError(err?.message || 'Google đăng nhập thất bại');
        });
    });
  }

  const handlePasteTokenOk = () => {
    setIsTokenModalVisible(false);
    if (!pastedToken) return;
    // send pasted token same as google flow
    fetch('http://localhost:8080/api/auth/google', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: pastedToken })
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || 'Google login failed') }))
      .then((res: any) => {
        if (res?.access_token) {
          try { localStorage.setItem('access_token', res.access_token); } catch (e) {}
          import('../lib/api').then(({ getProfile }) => {
            getProfile().then((user: any) => { try { if (user?.fullName) localStorage.setItem('user_fullName', user.fullName); } catch (e) {} window.location.href = '/'; }).catch(() => window.location.href = '/');
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
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: '#f5222d', background: '#fff1f0', padding: 12, borderRadius: 6 }}>
              {loginError}
            </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link href="#">Quên mật khẩu?</Link>
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Đăng nhập
        </Button>
      </Form.Item>

      {/* === PHẦN BỔ SUNG === */}
      <Divider>Hoặc</Divider>

      <Form.Item>
        <div id="google-signin-button" style={{ marginBottom: 12 }} />
        <Button 
          block 
          icon={<GoogleIcon />} 
          size="large" 
          onClick={handleGoogleLogin}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Đăng nhập với Google
        </Button>
      </Form.Item>
      {/* === KẾT THÚC PHẦN BỔ SUNG === */}

      <Modal title="Dán Google ID token" open={isTokenModalVisible} onOk={handlePasteTokenOk} onCancel={() => setIsTokenModalVisible(false)} okText="Gửi">
        <Input.TextArea rows={4} value={pastedToken} onChange={(e) => setPastedToken(e.target.value)} placeholder="Dán id_token ở đây" />
      </Modal>
    </Form>
  );
};

  // --- Register Form Component ---
  const RegisterForm = () => {
    const [form] = Form.useForm();
    const onFinish = (values: any) => {
      const { fullName, email, phone, password } = values;
      import("../lib/api").then(({ default: api }) => {
        api
          .register(fullName, email, phone, password)
          .then((_res: any) => {
            message.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
            try { form.resetFields(); } catch (e) {}
          })
          .catch((err: any) => {
            message.error(err.message || "Đăng ký thất bại");
          });
      });
    };
  

  return (
    <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
      <Form.Item
        name="fullName"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
      </Form.Item>
      
      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: 'email', message: 'Email không đúng định dạng!' }
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

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
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


// --- Main Auth Page Component ---
export default function AuthPage() {
  const items: TabsProps['items'] = [
    {
      key: 'login',
      label: 'Đăng nhập',
      children: <LoginForm />,
    },
    {
      key: 'register',
      label: 'Đăng ký',
      children: <RegisterForm />,
    },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 8px 24px hsla(210, 8%, 62%, .2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          {/* Bạn có thể thay thế bằng logo của mình */}
          {/* <Image src="/logo.svg" alt="Logo" width={150} height={50} /> */}
          <Title level={3} style={{textAlign:"center"}}>Chào mừng bạn đến với website của chúng tôi</Title>
          <Text type="secondary">Vui lòng đăng nhập hoặc đăng ký để tiếp tục</Text>
        </div>
        <Tabs defaultActiveKey="login" items={items} centered />
      </Card>
    </div>
  );
}