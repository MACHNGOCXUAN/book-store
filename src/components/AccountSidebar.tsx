import {
  HeartOutlined,
  ShoppingOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Menu } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface AccountSidebarProps {
  userLevel?: string;
  selectedKey?: string;
  onMenuSelect?: (key: string) => void;
}

const AccountSidebar = ({
  selectedKey = "profile",
  onMenuSelect,
}: AccountSidebarProps) => {
  const authUser = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [fullname] = useState(authUser?.fullName || "");

  const menuItems = [
    {
      key: "account-info",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
      children: [
        { key: "profile", label: "Hồ sơ cá nhân" },
        { key: "address", label: "Số địa chỉ" },
        { key: "change-password", label: "Đổi mật khẩu" },
      ],
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Đơn hàng của tôi",
    },
    {
      key: "vouchers",
      icon: <WalletOutlined />,
      label: (
        <span>
          Ví voucher
          <Badge
            count={12}
            style={{ marginLeft: 8, backgroundColor: "#C92127" }}
          />
        </span>
      ),
    },
    {
      key: "favorites",
      icon: <HeartOutlined />,
      label: "Sản phẩm yêu thích",
    },
  ];

  const handleMenuSelect = ({ key }: { key: string }) => {
    // Navigate to the appropriate route
    switch (key) {
      case "profile":
        navigate(".");
        break;
      case "address":
        navigate("address");
        break;
      case "change-password":
        // Navigate to the change-password route (match route config)
        navigate("change-password");
        break;
      case "vouchers":
        // route path is "vouchers"
        navigate("vouchers");
        break;
      case "favorites":
        navigate("favorites");
        break;
      case "orders":
        navigate("orders");
        break;
      default:
        break;
    }

    // Call the callback if provided
    if (onMenuSelect) {
      onMenuSelect(key);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* User Info Section */}
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Avatar
          size={80}
          icon={<UserOutlined />}
          style={{
            backgroundColor: "#f0f0f0",
            border: "4px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        />
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "#333",
              marginBottom: 4,
            }}
          >
            {fullname}
          </div>
        </div>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={["account-info"]}
        items={menuItems}
        style={{
          border: "none",
          fontSize: 14,
        }}
        onSelect={handleMenuSelect}
      />
    </div>
  );
};

export default AccountSidebar;
