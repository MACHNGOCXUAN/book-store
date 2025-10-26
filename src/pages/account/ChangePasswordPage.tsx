import { Button, Card, Form, Input } from "antd";
import { useState } from "react";
import { API_BASE } from "../../config/api";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { toast } from "react-toastify";
interface ChangePasswordProps {
  onSave?: (data: PasswordFormData) => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage = ({ onSave }: ChangePasswordProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token, user } = useSelector((state: RootState) => state.auth);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/customer/${user?.userId}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          }),
        }
      );

      const result = await res.json();

      if (
        result.message?.includes("không đúng") ||
        result.message?.includes("không tồn tại")
      ) {
        toast.warning(result.message);
      } else {
        toast.success(result.message);
        form.resetFields();
        if (onSave) onSave(values);
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error("Có lỗi xảy ra khi đổi mật khẩu 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={<div style={{ fontSize: 18, fontWeight: 600 }}>Đổi mật khẩu</div>}
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label={
            <span style={{ fontWeight: 500 }}>
              Mật khẩu hiện tại<span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          name="currentPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
          ]}
        >
          <Input.Password
            placeholder="Mật khẩu hiện tại"
            size="large"
            style={{ borderRadius: 8 }}
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: 500 }}>
              Mật khẩu mới<span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            placeholder="Mật khẩu mới"
            size="large"
            style={{ borderRadius: 8 }}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: 500 }}>
              Nhập lại mật khẩu mới<span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            size="large"
            style={{ borderRadius: 8 }}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSave}
            loading={loading}
            style={{
              background: "#C92127",
              borderColor: "#C92127",
              borderRadius: 8,
              fontWeight: 600,
              height: 48,
              width: "100%",
              maxWidth: 200,
            }}
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "#FFF5F5",
          borderRadius: 8,
          fontSize: 13,
          color: "#666",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8, color: "#C92127" }}>
          Lưu ý:
        </div>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Mật khẩu phải có ít nhất 6 ký tự</li>
          <li>Nên sử dụng kết hợp chữ hoa, chữ thường và số</li>
          <li>Không chia sẻ mật khẩu với người khác</li>
        </ul>
      </div>
    </Card>
  );
};

export default ChangePasswordPage;
