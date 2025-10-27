// src/components/auth/forgot/RequestOtpForm.tsx
import React from "react";
import { Form, Input, Button, Divider, type FormInstance } from "antd";
import { ArrowLeftOutlined, MailOutlined } from "@ant-design/icons";

interface RequestOtpFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  loading: boolean;
  onSwitchToLogin: () => void;
}

const RequestOtpForm: React.FC<RequestOtpFormProps> = ({
  form,
  onFinish,
  loading,
  onSwitchToLogin,
}) => {
  return (
    <Form layout="vertical" size="large" form={form} onFinish={onFinish}>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không đúng định dạng!" },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="you@example.com" />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        block
        loading={loading}
        style={{ height: 40, borderRadius: 6, fontWeight: 600 }}
      >
        Gửi mã OTP
      </Button>
      <Divider>hoặc</Divider>
      <div style={{ textAlign: "center" }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onSwitchToLogin}
        >
          Quay lại Đăng nhập
        </Button>
      </div>
    </Form>
  );
};

export default RequestOtpForm;
