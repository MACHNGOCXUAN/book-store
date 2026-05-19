// src/components/header/HeaderSecondaryNav.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Grid } from "antd";

const { useBreakpoint } = Grid;

const HeaderSecondaryNav: React.FC = () => {
  const screens = useBreakpoint();

  // Component này cũng tự ẩn trên mobile
  if (!screens.md) {
    return null;
  }

  return (
    <div style={{ backgroundColor: "#CF262D" }}>
      <div
        className="container"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 16px",
          backgroundColor: "#CF262D",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            padding: "12px 0",
            background: "#CF262D",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
          >
            Trang chủ
          </Link>
          <Link
            to="about"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
          >
            Giới thiệu
          </Link>
          <Link
            to="/membership"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              position: "relative",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
          >
            Membership
            <span
              style={{
                position: "absolute",
                top: -8,
                right: -35,
                background: "#FF3B5C",
                color: "white",
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 12,
                border: "1px solid white",
              }}
            >
              HOT
            </span>
          </Link>

          <Link
            to="/articles"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
          >
            Bài báo
          </Link>
          <Link
            to="/reviews"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
          >
            Review sách
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeaderSecondaryNav;
