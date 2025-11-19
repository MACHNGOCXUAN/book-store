import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Col, Row } from "antd";
import { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import AccountSidebar from "../components/AccountSidebar";
import AccountInfoPage from "./account/AccountInfoPage";

const AccountPage = () => {
  const location = useLocation();
  const [showAlert, setShowAlert] = useState(true);

  const userData = {
    profile: {
      firstName: "",
      lastName: "",
      phone: "0974122850",
      email: "",
      gender: "male" as const,
      birthday: {
        day: "",
        month: "",
        year: "",
      },
    },
  };

  const getSelectedMenu = () => {
    const pathname = location.pathname;
    if (pathname === "/account") return "profile";
    if (pathname.includes("exchange-vouchers")) return "exchange-vouchers";
    if (pathname.includes("vouchers")) return "vouchers";
    if (pathname.includes("orders")) return "orders";
    if (pathname.includes("address")) return "address";
    if (pathname.includes("password")) return "change-password";
    if (pathname.includes("favorites")) return "favorites";
    return "profile";
  };

  const selectedMenu = getSelectedMenu();

  const handleSaveProfile = (data: any) => {
    console.log("Profile saved:", data);
    // Here you would typically call an API to save the data
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
            <AccountSidebar selectedKey={selectedMenu} />
          </Col>

          {/* Main Content Area */}
          <Col xs={24} lg={18}>
            {selectedMenu === "profile" ? (
              <AccountInfoPage
                initialData={userData.profile}
                onSave={handleSaveProfile}
              />
            ) : (
              <Outlet />
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AccountPage;
