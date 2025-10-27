// src/components/auth/forgot/ResetPasswordForm.tsx
import React from "react";
import {
  Form,
  Input,
  Button,
  Space,
  Divider,
  Typography,
  type FormInstance,
} from "antd";
// 1. Thay đổi icon import
import {
  ArrowLeftOutlined,
  LockOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface ResetPasswordFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  onResendOtp: () => void;
  loading: boolean;
  resendLeft: number;
  maskedEmail: string;
  onSwitchToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  form,
  onFinish,
  onResendOtp,
  loading,
  resendLeft,
  maskedEmail,
  onSwitchToLogin,
}) => {
  return (
    <Form layout="vertical" size="large" form={form} onFinish={onFinish}>
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Chúng tôi đã gửi mã đến: <Text strong>{maskedEmail}</Text>
      </Text>

      <Form.Item
        name="otp"
        label="Mã OTP (6 số)"
        rules={[
          { required: true, message: "Vui lòng nhập mã OTP!" },
          { len: 6, message: "OTP phải gồm 6 số!" },
          { pattern: /^\d{6}$/, message: "OTP chỉ gồm chữ số." },
        ]}
      >
        <Input
          // 2. Thay đổi icon tại đây
          prefix={<MessageOutlined />}
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu mới"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu mới!" },
          { min: 8, message: "Tối thiểu 8 ký tự." },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
            message: "Phải có chữ và số.",
          },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="********" />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Nhập lại mật khẩu"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Vui lòng nhập lại mật khẩu!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value)
                return Promise.resolve();
              return Promise.reject(new Error("Mật khẩu nhập lại không khớp!"));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="********" />
      </Form.Item>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          style={{ height: 40, borderRadius: 6, fontWeight: 600 }}
        >
          Đặt lại mật khẩu
        </Button>

        <Button
          block
          onClick={onResendOtp}
          disabled={resendLeft > 0}
          style={{ borderRadius: 6 }}
        >
          {resendLeft > 0 ? `Gửi lại OTP (${resendLeft}s)` : "Gửi lại OTP"}
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
      </Space>
    </Form>
  );
};

export default ResetPasswordForm;
