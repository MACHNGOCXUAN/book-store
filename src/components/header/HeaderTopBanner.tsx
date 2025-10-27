// src/components/header/HeaderTopBanner.tsx
import React from "react";
import { Grid } from "antd";

const { useBreakpoint } = Grid;

const HeaderTopBanner: React.FC = () => {
  const screens = useBreakpoint();

  // Component này tự quản lý việc ẩn/hiện trên mobile
  if (!screens.md) {
    return null;
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #C92127 0%, #E63946 100%)",
        padding: "8px 0",
      }}
    >
      <div
        className="container"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
      >
        <div
          style={{
            textAlign: "center",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          🎉 DOANH NHÂN NUÔI CHÍ - SÁCH HAY ĐƯỜNG TRÍ{" "}
          <span
            style={{
              background: "white",
              color: "#C92127",
              padding: "2px 12px",
              borderRadius: 20,
              marginLeft: 8,
              fontWeight: 700,
            }}
          >
            Giảm đến 50%
          </span>{" "}
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "2px 12px",
              borderRadius: 20,
              marginLeft: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            MUA NGAY
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderTopBanner;
