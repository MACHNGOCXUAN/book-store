"use client"

// src/components/ProductCard.tsx

import type React from "react"
import { useNavigate } from "react-router-dom"
import type { Book } from "../types/Book"
import { Card, Button, Typography, Tooltip } from "antd"
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons"

interface ProductCardProps {
  book: Book
  onAddToCart?: (book: Book) => void
}

const { Text } = Typography

const ProductCard: React.FC<ProductCardProps> = ({ book, onAddToCart }) => {
  const navigate = useNavigate()

  // Hàm điều hướng đến trang chi tiết sản phẩm
  const handleViewDetails = () => {
    navigate(`/books/${book.bookId}`)
  }

  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
            aspectRatio: "3/4",
            borderBottom: "1px solid #f0f0f0",
            padding: "12px",
            height: "220px", // 👈 giảm chiều cao (mặc định bạn đang để full tỷ lệ)
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            alt={book.title}
            src={book.coverImage}
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      }

      style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        padding: "20px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"
        e.currentTarget.style.transform = "translateY(-4px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <div>
        <Tooltip title={book.title}>
          <Text
            strong
            style={{
              display: "block",
              fontSize: "16px",
              marginBottom: "8px",
              lineHeight: "1.4",
              height: "44px",
              overflow: "hidden",
            }}
          >
            {book.title}
          </Text>
        </Tooltip>

        <Text
          type="secondary"
          style={{
            display: "block",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {book.author}
        </Text>
      </div>

      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            marginBottom: 16,
            textAlign: "center",
            padding: "12px",
            backgroundColor: "#f0f5ff",
            borderRadius: "8px",
          }}
        >
          <Text
            strong
            style={{
              fontSize: "20px",
              color: "#1890ff",
              fontWeight: 600,
            }}
          >
            {Number(book.price).toLocaleString("vi-VN")} ₫
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={handleViewDetails}
            style={{
              flex: 1,
              borderRadius: "8px",
              height: "40px",
              fontWeight: 500,
            }}
          >
            Xem chi tiết
          </Button>

          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => onAddToCart?.(book)}
            style={{
              flex: 1,
              borderRadius: "8px",
              height: "40px",
              fontWeight: 500,
              background: "linear-gradient(135deg, #667eea 0%)",
              border: "none",
            }}
          >
            Thêm giỏ
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ProductCard
