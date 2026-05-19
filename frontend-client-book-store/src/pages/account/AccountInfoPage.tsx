import { Button, Card, Col, Form, Input, Row, DatePicker, Radio } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
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
    // Lấy user profile từ localStorage nếu backend chưa trả về gender/birthday
    let userFromLocalStorage: any = null;
    try {
      const stored = localStorage.getItem("user_profile");
      if (stored) {
        userFromLocalStorage = JSON.parse(stored);
      }
    } catch {}

    // Try to get birthday from multiple sources
    let birthday = null;

    // First, try dateOfBirth from authUser
    if (authUser?.birthday) {
      birthday = dayjs(authUser.birthday);
    }
    // Then try birthday from authUser
    else if (authUser?.birthday) {
      birthday = dayjs(authUser.birthday);
    }
    // Then try from localStorage
    else if (userFromLocalStorage?.dateOfBirth) {
      birthday = dayjs(userFromLocalStorage.dateOfBirth);
    } else if (userFromLocalStorage?.birthday) {
      birthday = dayjs(userFromLocalStorage.birthday);
    }
    // Finally try from initialData
    else if (initialData?.birthday?.year) {
      birthday = dayjs(
        `${initialData.birthday.year}-${initialData.birthday.month}-${initialData.birthday.day}`
      );
    }

    form.setFieldsValue({
      fullname: authUser?.fullName || initialData?.firstName || "",
      phone: authUser?.phone || initialData?.phone || "",
      email: authUser?.email || initialData?.email || "",
      gender:
        authUser?.gender ||
        userFromLocalStorage?.gender ||
        initialData?.gender ||
        "male",
      birthday: birthday,
    });
  }, [authUser, form, initialData]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      console.log("=== FORM VALUES ===");
      console.log("values.birthday type:", typeof values.birthday);
      console.log("values.birthday value:", values.birthday);
      console.log("values.birthday is null:", values.birthday === null);
      console.log(
        "values.birthday is undefined:",
        values.birthday === undefined
      );

      const payload: any = {
        fullName: values.fullname,
        email: values.email,
        phone: values.phone,
      };

      // Add gender if provided
      if (values.gender) {
        payload.gender = values.gender;
      }

      // Add birthday if provided
      if (values.birthday) {
        const birthdayStr = values.birthday.format("YYYY-MM-DD");
        payload.dateOfBirth = birthdayStr;
        console.log(
          "Birthday payload:",
          birthdayStr,
          "Dayjs object:",
          values.birthday
        );
      } else {
        console.log("WARNING: values.birthday is falsy, not adding to payload");
      }

      console.log("Final payload:", payload);
      const result = await dispatch(updateUser(payload)).unwrap();
      console.log("Update result:", result);

      // Lưu gender và birthday vào localStorage
      try {
        const userProfile: any = {
          ...result,
          gender: values.gender,
          birthday: values.birthday
            ? values.birthday.format("YYYY-MM-DD")
            : undefined,
        };
        localStorage.setItem("user_profile", JSON.stringify(userProfile));
        localStorage.setItem("user_fullName", userProfile.fullName);
      } catch {}

      toast.success("Cập nhật thông tin thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Refresh user profile từ server
      dispatch(fetchUserProfile());

      if (onSave) {
        onSave(result);
      }
    } catch (error: any) {
      const errorMsg = error?.message || "Cập nhật thất bại. Vui lòng thử lại!";
      console.error("Update error:", error);
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
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Giới tính</span>}
              name="gender"
            >
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Ngày sinh</span>}
              name="birthday"
            >
              <DatePicker
                placeholder="VD: 24/12/2004"
                size="large"
                style={{ borderRadius: 8, width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

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
