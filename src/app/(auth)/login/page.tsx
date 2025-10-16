"use client";
import React from "react";
import type { FormProps } from "antd";
import { Button, Divider, Form, Input } from "antd";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getProfileUser, loginUser } from "@/stores/slices/auth.slice";
import { useRouter } from "next/navigation";
import { GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { Image } from "@/assets/images";

type FieldType = {
  phone?: string;
  password?: string;
  remember?: string;
};

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    await dispatch(loginUser(values));
    await dispatch(getProfileUser());
    // router.push("/products");
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
          <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
        </div>

        <Form
          name="login_form"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item<FieldType>
            name="phone"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại hoặc email!",
              },
            ]}
            className="mb-4"
          >
            <Input
              placeholder="Số điện thoại hoặc email"
              size="large"
              className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>
          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            className="mb-2"
          >
            <Input.Password
              placeholder="Mật khẩu"
              size="large"
              className="rounded-lg h-12 border-gray-300 hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <div className="flex justify-end my-5!">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-800 font-bold"
            >
              Quên mật khẩu?
            </a>
          </div>

          <Form.Item className="mb-6">
            <Button
              // loading={loading}
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-lg font-semibold text-white border-none"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: '#7cb305' }}>Solid</Divider>

        <div className="flex flex-col gap-4 my-2!">
          <Button
            icon={<GoogleOutlined/>}
            size="large"
            className="w-full mb-3 h-12 rounded-lg border-gray-300 flex items-center justify-center text-gray-700 font-medium hover:border-blue-500 hover:text-blue-600"
          >
            Tiếp tục với Google
          </Button>

          <Button
            icon={<FacebookFilled className="text-blue-600" />}
            size="large"
            className="w-full mb-6 h-12 rounded-lg border-gray-300 flex items-center justify-center text-gray-700 font-medium hover:border-blue-500"
          >
            Tiếp tục với Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Bạn chưa có tài khoản?{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => {
              e.preventDefault();
              router.push("/register");
            }}
          >
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
