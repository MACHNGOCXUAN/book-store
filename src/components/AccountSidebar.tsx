import {
  HeartOutlined,
  ShoppingOutlined,
  UserOutlined,
  WalletOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Menu } from "antd";
import { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { fetchWalletVoucherStats } from "../services/loyaltyService";
import "../styles/AccountSidebar.css";

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
  const isGoogleLogin = useAppSelector((s) => s.auth.isGoogleLogin);
  const [fullname] = useState(authUser?.fullName || "");
  const [voucherCount, setVoucherCount] = useState(0);

  // Load voucher count from stats
  useEffect(() => {
    const loadVoucherStats = async () => {
      try {
        const token = localStorage.getItem("access_token") || "";
        if (token) {
          const stats = await fetchWalletVoucherStats(token);
          // Use availableVouchers count from stats
          setVoucherCount(stats.availableVouchers || 0);
          console.log("📊 Voucher stats loaded:", stats);
        }
      } catch (error) {
        console.error("Error loading voucher stats:", error);
        setVoucherCount(0);
      }
    };

    loadVoucherStats();
  }, []);

  // Determine initial openKeys based on selectedKey
  const getInitialOpenKeys = () => {
    if (["profile", "address", "change-password"].includes(selectedKey)) {
      return ["account-info"];
    }
    return [];
  };

  const [openKeys, setOpenKeys] = useState<string[]>(getInitialOpenKeys());

  // Update openKeys when selectedKey changes from parent component
  useEffect(() => {
    if (["profile", "address", "change-password"].includes(selectedKey)) {
      setOpenKeys(["account-info"]);
    } else {
      setOpenKeys([]);
    }
  }, [selectedKey]);

  const changePasswordItem = { key: "change-password", label: "Đổi mật khẩu" };

  const accountInfoChildren = [
    { key: "profile", label: "Hồ sơ cá nhân" },
    { key: "address", label: "Số địa chỉ" },
    ...(isGoogleLogin ? [] : [changePasswordItem]),
  ];

  const menuItems = [
    {
      key: "account-info",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
      children: accountInfoChildren,
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
            count={voucherCount}
            style={{ marginLeft: 8, backgroundColor: "#C92127" }}
          />
        </span>
      ),
    },
    {
      key: "exchange-vouchers",
      icon: <GiftOutlined />,
      label: (
        <span>
          Đổi voucher bằng điểm
          <Badge
            count="NEW"
            style={{ marginLeft: 8, backgroundColor: "#FF9800" }}
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
    // Call the callback if provided
    if (onMenuSelect) {
      onMenuSelect(key);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
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
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
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
