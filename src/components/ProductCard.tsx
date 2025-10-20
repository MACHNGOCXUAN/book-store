"use client"

// src/components/ProductCard.tsx

import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import { Button, Card, Tooltip, Typography } from "antd"
import type React from "react"
import { useNavigate } from "react-router-dom"
import type { Book } from "../types/Book"
import { toast } from "react-toastify"
import { useAppDispatch } from "../store/hooks"
import { addOrUpdateCartItem } from "../features/cart/cartSlice"

interface ProductCardProps {
  book: Book
  onAddToCart?: (book: Book) => void
}

const { Text } = Typography

const ProductCard: React.FC<ProductCardProps> = ({ book }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Hàm điều hướng đến trang chi tiết sản phẩm
  const handleViewDetails = () => {
    navigate(`/books/${book.bookId}`)
  }

  const handleAddToCart = async () => {
    try {
      await dispatch(addOrUpdateCartItem({ bookId: book.bookId, quantity: 1 })).unwrap();
      toast.success("Đã thêm vào giỏ hàng!");
      // Emit event so Header and other listeners update
      try {
        const ev = new CustomEvent('cart-updated', { detail: { added: true } });
        window.dispatchEvent(ev);
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      toast.error(err || 'Thêm giỏ hàng thất bại');
    }
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
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #f0f0f0",
        background: "#ffffff",
      }}
      bodyStyle={{
        padding: "16px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(201,33,39,0.2)"
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.borderColor = "#C92127"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.borderColor = "#f0f0f0"
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
            marginBottom: 12,
            textAlign: "left",
          }}
        >
          <Text
            strong
            style={{
              fontSize: "18px",
              color: "#C92127",
              fontWeight: 700,
            }}
          >
            {(Number(book.price) - (Number(book.price) * Number(book.discountPercent) / 100)).toLocaleString("vi-VN")}₫
          </Text>
          <br />
          <Text
            delete
            type="secondary"
            style={{
              fontSize: "14px",
            }}
          >
            {(Number(book.price)).toLocaleString("vi-VN")}₫
          </Text>
          <Text
            style={{
              fontSize: "12px",
              color: "#C92127",
              marginLeft: 8,
              fontWeight: 600,
            }}
          >
            {`-${book.discountPercent}%`}
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
            size="small"
            icon={<EyeOutlined />}
            onClick={handleViewDetails}
            style={{
              flex: 1,
              borderRadius: "6px",
              height: "36px",
              fontWeight: 500,
              border: "1px solid #E0E0E0",
              color: "#666",
              fontSize: "13px",
            }}
          >
            Chi tiết
          </Button>

          <Button
            type="primary"
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleAddToCart()}
            style={{
              flex: 1,
              borderRadius: "6px",
              height: "36px",
              fontWeight: 500,
              background: "#C92127",
              border: "none",
              fontSize: "13px",
            }}
          >
            Thêm vào giỏ hàng
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ProductCard
