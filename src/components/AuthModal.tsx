// src/components/AuthModal.tsx
"use client";

import React, { useState } from "react";
import { Modal, Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";

// Import các form con từ thư mục /auth

const { Title, Text } = Typography;

/* ===================== Props Types ===================== */
interface AuthModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// Định nghĩa các view có thể có
type AuthView = "login" | "register" | "forgotPassword";

/* ===================== Auth Modal ===================== */
const AuthModal: React.FC<AuthModalProps> = ({ open, onCancel, onSuccess }) => {
  // State để quản lý view
  const [view, setView] = useState<AuthView>("login");

  // Xử lý khi đóng modal, luôn reset về view 'login'
  const handleCancel = () => {
    onCancel();
    // Thêm một delay nhỏ để người dùng không thấy view bị đổi trước khi modal đóng
    setTimeout(() => {
      setView("login");
    }, 300);
  };

  const items: TabsProps["items"] = [
    {
      key: "login",
      label: "Đăng nhập",
      children: (
        <LoginForm
          onSuccess={onSuccess}
          onSwitchToForgotPassword={() => setView("forgotPassword")}
        />
      ),
    },
    {
      key: "register",
      label: "Đăng ký",
      children: <RegisterForm onSwitchToLogin={() => setView("login")} />,
    },
  ];

  // Tiêu đề động dựa trên view
  const modalTitle = (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Title level={3} style={{ textAlign: "center", margin: 0 }}>
        {view === "forgotPassword" ? "Quên mật khẩu" : "Chào mừng bạn"}
      </Title>
      <Text type="secondary">
        {view === "forgotPassword"
          ? "Nhập email của bạn để lấy lại mật khẩu"
          : "Đăng nhập hoặc đăng ký để tiếp tục"}
      </Text>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleCancel} // Sử dụng handler mới
      title={modalTitle}
      footer={null}
      centered
      width={420}
    >
      {/* Hiển thị có điều kiện */}
      {view === "forgotPassword" ? (
        <ForgotPasswordForm onSwitchToLogin={() => setView("login")} />
      ) : (
        <Tabs
          activeKey={view}
          onChange={(key) => setView(key as AuthView)}
          items={items}
          centered
        />
      )}
    </Modal>
  );
};

export default AuthModal;
