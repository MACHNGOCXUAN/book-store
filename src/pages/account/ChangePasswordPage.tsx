import { Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { API_BASE } from "../../config/api";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { toast } from "react-toastify";
import { useAccountContext } from "../../context/AccountContext";

const { Link: TextLink } = Typography;

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

  // Lấy context từ AccountLayout
  const { setShowForgotPassword } = useAccountContext();

  const handleSave = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();

      // Additional validation
      if (!user?.userId) {
        toast.error("Không thể xác định người dùng");
        return;
      }

      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

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

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.message || "Đổi mật khẩu thất bại");
        return;
      }

      const result = await res.json();

      if (result.message?.includes("thành công")) {
        toast.success(result.message || "Đổi mật khẩu thành công");
        form.resetFields();
        if (onSave) onSave(values);
      } else if (result.message?.includes("không đúng")) {
        toast.warning(result.message || "Mật khẩu hiện tại không đúng");
      } else {
        toast.info(result.message || "Đã xử lý yêu cầu");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.message === "Failed to fetch") {
        toast.error("Không thể kết nối tới máy chủ");
      } else {
        toast.error("Có lỗi xảy ra khi đổi mật khẩu 😢");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={<div style={{ fontSize: 18, fontWeight: 600 }}>Đổi mật khẩu</div>}
      variant="outlined"
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        {/* Hidden username field for accessibility */}
        <input
          type="text"
          style={{ display: "none" }}
          autoComplete="username"
        />

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

        <Form.Item
          style={{
            marginBottom: 0,
            marginTop: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
                maxWidth: 200, // Giữ lại max-width
              }}
            >
              Lưu thay đổi
            </Button>
            <TextLink
              onClick={() => setShowForgotPassword(true)}
              style={{
                display: "block",
                textAlign: "center",
                // marginTop: 16, <-- XÓA DÒNG NÀY
              }}
            >
              Bạn quên mật khẩu ư?
            </TextLink>
          </div>
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
