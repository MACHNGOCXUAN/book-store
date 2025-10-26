import { Button, Card, Col, Form, Input, Row } from "antd";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateUser, fetchUserProfile } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
interface UserProfileProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    gender?: "male" | "female";
    birthday?: {
      day?: string;
      month?: string;
      year?: string;
    };
  };
  onSave?: (data: any) => void;
}

const AccountInfoPage = ({ initialData, onSave }: UserProfileProps) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const loading = useAppSelector((s) => s.auth.loading);

  // Fetch user profile khi component load và có token
  useEffect(() => {
    if (token) {
      console.log("AccountInfoPage - Fetching user profile with token:", token);
      dispatch(fetchUserProfile());
    }
  }, [token, dispatch]);

  useEffect(() => {
    form.setFieldsValue({
      fullname: authUser?.fullName || initialData?.firstName || "",
      phone: authUser?.phone || initialData?.phone || "",
      email: authUser?.email || initialData?.email || "",
    });
  }, [authUser, form, initialData]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const result = await dispatch(
        updateUser({
          fullName: values.fullname,
          email: values.email,
          phone: values.phone,
        })
      ).unwrap();

      toast.success("Cập nhật thông tin thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Refresh user profile từ server để đảm bảo dữ liệu luôn đồng bộ
      dispatch(fetchUserProfile());

      if (onSave) {
        onSave(result);
      }
    } catch (error: any) {
      const errorMsg = error?.message || "Cập nhật thất bại. Vui lòng thử lại!";
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error("Update failed:", error);
    }
  };

  return (
    <Card
      title={<div style={{ fontSize: 18, fontWeight: 600 }}>Hồ sơ cá nhân</div>}
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          firstName: initialData?.firstName || "",
          lastName: initialData?.lastName || "",
          phone: initialData?.phone || "",
          email: initialData?.email || "",
          gender: initialData?.gender || "male",
          day: initialData?.birthday?.day || "",
          month: initialData?.birthday?.month || "",
          year: initialData?.birthday?.year || "",
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
              name="fullname"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input
                placeholder="Nhập họ"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input
                placeholder="phone number"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={<span style={{ fontWeight: 500 }}>Email</span>}
          name="email"
          rules={[{ type: "email", message: "Email không hợp lệ!" }]}
        >
          <Input
            placeholder="Chưa có email"
            size="large"
            style={{ borderRadius: 8 }}
            // addonAfter={
            //     <a href="#" style={{ color: '#C92127', textDecoration: 'none', fontSize: 13 }}>
            //         Thêm mới
            //     </a>
            // }
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
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
    </Card>
  );
};

export default AccountInfoPage;
