// src/components/header/HeaderActions.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Dropdown, Space, type MenuProps } from "antd";
import {
  BellOutlined,
  GlobalOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface HeaderActionsProps {
  isLoggedIn: boolean;
  displayName: string;
  cartCount: number;
  onLogout: () => void;
  onLoginClick: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  isLoggedIn,
  displayName,
  cartCount,
  onLogout,
  onLoginClick,
}) => {
  const [hoveredCart, setHoveredCart] = useState(false);
  const navigate = useNavigate();

  const userMenuItems: MenuProps["items"] = [
    { key: "profile", label: "Trang cá nhân", icon: <SolutionOutlined /> },
    {
      key: "orders",
      label: "Đơn hàng của tôi",
      icon: <ShoppingCartOutlined />,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") return onLogout();
    if (key === "profile") return navigate("/account");
    if (key === "orders") return navigate("/account/orders");
  };

  return (
    <Space size="middle">
      {/* Notifications */}
      <Button
        type="text"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "auto",
          padding: "4px 8px",
          color: "#666",
          transition: "color 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
      >
        <BellOutlined style={{ fontSize: 24 }} />
        <span style={{ fontSize: 11, marginTop: 2 }}>Thông Báo</span>
      </Button>

      {/* Cart */}
      <Link to="/cart">
        <Button
          type="text"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "auto",
            padding: "4px 8px",
            color: hoveredCart ? "#C92127" : "#666",
            transition: "color 0.3s",
          }}
          onMouseEnter={() => setHoveredCart(true)}
          onMouseLeave={() => setHoveredCart(false)}
        >
          <Badge count={cartCount} offset={[-8, 2]}>
            <ShoppingCartOutlined
              style={{
                fontSize: 24,
                color: hoveredCart ? "#C92127" : "#666",
                transition: "color 0.3s",
              }}
            />
          </Badge>
          <span style={{ fontSize: 11, marginTop: 2 }}>Giỏ Hàng</span>
        </Button>
      </Link>

      {/* Account */}
      {isLoggedIn ? (
        <Dropdown
          placement="bottomRight"
          trigger={["click"]}
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
        >
          <Button
            type="text"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "auto",
              padding: "4px 8px",
              color: "#666",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
          >
            <UserOutlined style={{ fontSize: 24 }} />
            <span style={{ fontSize: 11, marginTop: 2 }}>{displayName}</span>
          </Button>
        </Dropdown>
      ) : (
        <Button
          type="text"
          onClick={onLoginClick}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "auto",
            padding: "4px 8px",
            color: "#666",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        >
          <UserOutlined style={{ fontSize: 24 }} />
          <span style={{ fontSize: 11, marginTop: 2 }}>Tài khoản</span>
        </Button>
      )}

      {/* Language */}
      <Button
        type="text"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 8px",
          color: "#666",
          transition: "color 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C92127")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
          alt="VN"
          style={{ width: 20, height: 14, borderRadius: 2 }}
        />
        <GlobalOutlined style={{ fontSize: 14 }} />
      </Button>
    </Space>
  );
};

export default HeaderActions;
