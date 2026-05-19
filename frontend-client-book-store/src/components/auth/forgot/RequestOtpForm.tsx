// src/components/auth/forgot/RequestOtpForm.tsx
import { ArrowLeftOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, type FormInstance } from "antd";
import React from "react";
import { emailValidationRulesBuiltIn } from "../../../utils/validation";

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
        rules={emailValidationRulesBuiltIn}
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
