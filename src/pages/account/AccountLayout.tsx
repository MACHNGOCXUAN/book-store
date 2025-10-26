import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Col, Row } from "antd";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AccountSidebar from "../../components/AccountSidebar";

const AccountLayout = () => {
  const [showAlert, setShowAlert] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current selected menu based on route
  const getSelectedMenu = () => {
    const pathname = location.pathname;
    if (pathname === "/account") return "profile";
    if (pathname.includes("orders")) return "orders";
    if (pathname.includes("address")) return "address";
    if (pathname.includes("password")) return "change-password";
    if (pathname.includes("vouchers")) return "vouchers";
    if (pathname.includes("favorites")) return "favorites";
    return "profile";
  };

  const selectedMenu = getSelectedMenu();

  const handleMenuSelect = (key: string) => {
    switch (key) {
      case "profile":
        navigate("/account");
        break;
      case "address":
        navigate("/account/address");
        break;
      case "change-password":
        navigate("/account/password");
        break;
      case "vouchers":
        navigate("/account/vouchers");
        break;
      case "favorites":
        navigate("/account/favorites");
        break;
      case "orders":
        navigate("/account/orders");
        break;
      default:
        break;
    }
  };

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        paddingTop: 20,
        paddingBottom: 40,
      }}
    >
      <div
        className="container"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
      >
        {/* Warning Alert */}
        {showAlert && selectedMenu === "profile" && (
          <Alert
            message={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                  Bạn vui lòng cập nhật thông tin tài khoản.
                </span>
                <a
                  href="#"
                  style={{
                    color: "#C92127",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Cập nhật thông tin ngay
                </a>
              </div>
            }
            type="error"
            closable
            onClose={() => setShowAlert(false)}
            style={{
              marginBottom: 20,
              borderRadius: 8,
              border: "1px solid #ff4d4f",
            }}
          />
        )}

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Sidebar */}
          <Col xs={24} lg={6}>
            <AccountSidebar
              selectedKey={selectedMenu}
              onMenuSelect={handleMenuSelect}
            />
          </Col>

          {/* Main Content Area */}
          <Col xs={24} lg={18}>
            <Outlet />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AccountLayout;
