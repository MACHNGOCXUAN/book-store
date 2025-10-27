// src/components/header/HeaderMobileDrawer.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Drawer, Menu, Space, Typography, type MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface HeaderMobileDrawerProps {
  open: boolean;
  onClose: () => void;
  categoryMenuItems: MenuProps["items"];
  isLoggedIn: boolean;
  displayName: string;
  onLoginClick: () => void;
}

const HeaderMobileDrawer: React.FC<HeaderMobileDrawerProps> = ({
  open,
  onClose,
  categoryMenuItems,
  isLoggedIn,
  displayName,
  onLoginClick,
}) => {
  const navigate = useNavigate();

  const handleAccountClick = () => {
    onClose();
    navigate("/account");
  };

  const handleLoginClick = () => {
    onClose();
    onLoginClick();
  };

  return (
    <Drawer
      title={
        <Title level={4} style={{ margin: 0 }}>
          Menu
        </Title>
      }
      placement="left"
      width={300}
      open={open}
      onClose={onClose}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Menu
          mode="inline"
          items={categoryMenuItems}
          style={{ border: "none" }}
        />
        {isLoggedIn ? (
          <Button block icon={<UserOutlined />} onClick={handleAccountClick}>
            {displayName}
          </Button>
        ) : (
          <Button
            block
            type="primary"
            icon={<UserOutlined />}
            onClick={handleLoginClick}
            style={{ background: "#C92127", borderColor: "#C92127" }}
          >
            Đăng nhập
          </Button>
        )}
      </Space>
    </Drawer>
  );
};

export default HeaderMobileDrawer;
