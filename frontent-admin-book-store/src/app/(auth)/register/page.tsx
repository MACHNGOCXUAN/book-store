"use client";
import { useAppDispatch } from "@/stores/hooks";
import {
  confirmPasswordValidationRules,
  emailValidationRules,
  passwordValidationRules,
  phoneValidationRules,
} from "@/utils/validation";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";

type FieldType = {
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

const RegisterPage = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      console.log("Register values: ", values);
      // TODO: Implement register API call
      // await dispatch(registerUser(values)).unwrap();
    } catch (error: any) {
      console.log("Register failed: ", error);
    }
  };

  return (
    <div
      className="relative min-h-screen min-w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg?auto=compress&cs=tinysrgb&w=600)`,
      }}
    >
      <div className="bg-white p-10! rounded-2xl shadow-xl w-full max-w-lg mx-4 shadow-orange-50">
        <div className="mb-8!">
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
        </div>

        <Form
          form={form}
          name="register_form"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          onSubmitCapture={(e) => e.preventDefault()}
        >
          <Form.Item<FieldType>
            name="email"
            rules={emailValidationRules}
            className="mb-4"
          >
            <Input
              placeholder="Email"
              size="large"
              type="email"
              className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="phone"
            rules={phoneValidationRules}
            className="mb-4"
          >
            <Input
              placeholder="Số điện thoại (0xxxxxxxxx)"
              size="large"
              className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={passwordValidationRules}
            className="mb-4"
          >
            <Input.Password
              placeholder="Mật khẩu (min 8 ký tự: 1 hoa, 1 thường, 1 số)"
              size="large"
              className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="confirmPassword"
            dependencies={["password"]}
            rules={confirmPasswordValidationRules}
            className="mb-2"
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu"
              size="large"
              className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item className="mb-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-lg font-semibold text-white border-none"
            >
              Đăng ký
            </Button>
          </Form.Item>

          <p className="text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}
            >
              Đăng nhập
            </a>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
