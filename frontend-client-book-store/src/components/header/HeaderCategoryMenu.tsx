// src/components/header/HeaderCategoryMenu.tsx
import { AppstoreOutlined, BookOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderCategoryMenuProps {
  categories: Array<[string, string]>; // [categoryId, categoryName]
}

const HeaderCategoryMenu: React.FC<HeaderCategoryMenuProps> = ({
  categories,
}) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setIsCategoryMenuOpen(true)}
      onMouseLeave={() => setIsCategoryMenuOpen(false)}
    >
      <Button
        type="text"
        icon={<AppstoreOutlined style={{ fontSize: 18 }} />}
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: "#333",
          border: "1px solid #E5E5E5",
          borderRadius: 4,
        }}
      />
      {isCategoryMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "90%",
            left: 0,
            marginTop: 4,
            backgroundColor: "white",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 250,
            maxHeight: 400,
            overflowY: "auto",
            zIndex: 1001,
          }}
          onMouseEnter={() => setIsCategoryMenuOpen(true)}
          onMouseLeave={() => setIsCategoryMenuOpen(false)}
        >
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                padding: "8px 16px",
                fontWeight: 600,
                color: "#C92127",
                borderBottom: "1px solid #f0f0f0",
                marginBottom: 4,
                fontSize: 14,
              }}
            >
              Danh mục sản phẩm
            </div>
            {categories.length === 0 ? (
              <div
                style={{
                  padding: "12px 16px",
                  color: "#999",
                  fontSize: 14,
                }}
              >
                Chưa có danh mục
              </div>
            ) : (
              categories.map(([categoryId, categoryName]) => (
                <Link
                  key={categoryId}
                  to={`/categories/${encodeURIComponent(categoryId)}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px",
                    color: "#333",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    gap: 8,
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFF5F5";
                    e.currentTarget.style.color = "#C92127";
                    e.currentTarget.style.paddingLeft = "20px";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#333";
                    e.currentTarget.style.paddingLeft = "16px";
                  }}
                >
                  <BookOutlined />
                  <span>{categoryName}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderCategoryMenu;
