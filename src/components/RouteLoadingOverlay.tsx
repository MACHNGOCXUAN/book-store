// src/components/RouteLoadingOverlay.tsx
import { useEffect } from "react";
import { Spin } from "antd";
import { useLocation, useNavigation } from "react-router-dom";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(255,255,255,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000, // cao hơn Header/Footer/Content
  backdropFilter: "blur(2px)",
};

export default function RouteLoadingOverlay() {
  const navigation = useNavigation();
  const location = useLocation();

  const isLoading = navigation.state === "loading";

  // Sau khi load xong thì scroll về top để thay cho ScrollToTop cũ
  useEffect(() => {
    if (navigation.state === "idle") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [location.pathname, navigation.state]);

  if (!isLoading) return null;

  return (
    <div style={overlayStyle}>
      <Spin size="large" tip="Đang tải trang..." />
    </div>
  );
}
