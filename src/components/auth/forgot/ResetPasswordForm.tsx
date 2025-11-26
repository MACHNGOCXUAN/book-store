// src/components/auth/forgot/ResetPasswordForm.tsx
import {
  ArrowLeftOutlined,
  LockOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  Input,
  Space,
  Typography,
  type FormInstance,
} from "antd";
import React from "react";
import {
  PASSWORD_REGEX,
  confirmPasswordValidationRules,
  isValidPassword,
  otpValidationRules,
  passwordValidationRules,
} from "../../../utils/validation";

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
  // Debug: In ra passwordValidationRules và PASSWORD_REGEX
  React.useEffect(() => {
    console.log("🔍 PASSWORD_REGEX:", PASSWORD_REGEX);
    console.log("🔍 passwordValidationRules:", passwordValidationRules);
    console.log("🔍 Test 'hithien123':", isValidPassword("hithien123"));
    console.log("🔍 Test 'Hithien123':", isValidPassword("Hithien123"));
  }, []);
  return (
    <Form layout="vertical" size="large" form={form} onFinish={onFinish}>
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Chúng tôi đã gửi mã đến: <Text strong>{maskedEmail}</Text>
      </Text>

      <Form.Item
        name="otp"
        label="Mã OTP (6 số)"
        rules={otpValidationRules}
      >
        <Input
          prefix={<MessageOutlined />}
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mật khẩu mới"
        rules={passwordValidationRules}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="********"
        />
      </Form.Item>      <Form.Item
        name="confirm"
        label="Nhập lại mật khẩu"
        dependencies={["password"]}
        rules={confirmPasswordValidationRules}
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
