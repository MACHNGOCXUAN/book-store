"use client";

import React, { useEffect, useState } from "react";
import { Card, Rate, Typography, Row, Col, Spin, Tooltip, Button } from "antd";
import { motion } from "framer-motion";
import { BookOutlined, EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../store/hooks";
import { addOrUpdateCartItem } from "../features/cart/cartSlice";
import { toast } from "react-toastify";

const { Text, Title } = Typography;

interface BookReview {
  book_id: string;
  book_title: string;
  book_author: string;
  book_cover?: string;
  rating: number;
  price: number;
  discount_percent: number;
  stock: number;
}

const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/reviews");
        if (!res.ok) throw new Error("Không thể tải dữ liệu review");
        const data = await res.json();

        const uniqueBooks: Record<string, BookReview> = {};
        data.forEach((r: any) => {
          const bookId = r.book_id;
          if (!uniqueBooks[bookId] || r.rating > uniqueBooks[bookId].rating) {
            uniqueBooks[bookId] = {
              book_id: r.book_id,
              book_title: r.book_title,
              book_author: r.book_author,
              book_cover: r.book_cover,
              rating: r.rating,
              price: r.book_price,
              discount_percent: r.book_discount_percent,
              stock: r.stock,
            };
          }
        });

        setReviews(Object.values(uniqueBooks));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleViewDetails = (bookId: string) => {
    window.location.href = `/books/${bookId}`;
  };

  const handleAddToCart = async (book: BookReview) => {
    if (book.stock <= 0) {
      toast.error("Sản phẩm hiện không có sẵn!");
      return;
    }
    try {
      await dispatch(addOrUpdateCartItem({ bookId: book.book_id, quantity: 1 })).unwrap();
      toast.success(`Đã thêm ${book.book_title} vào giỏ hàng!`);
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { added: true } }));
    } catch (err: any) {
      toast.error(err?.message || "Thêm vào giỏ hàng thất bại");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin tip="Đang tải dữ liệu sách..." size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: "60px 0" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Title level={2} style={{ textAlign: "center", color: "#333" }}>📚 Top Sách Được Yêu Thích</Title>
        </motion.div>

        {reviews.length === 0 ? (
          <Text type="secondary" style={{ display: "block", textAlign: "center" }}>Không có sách nào 😢</Text>
        ) : (
          <Row gutter={[24, 32]}>
            {reviews.map((book, i) => (
              <Col key={book.book_id} xs={12} sm={12} md={8} lg={6}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
                          height: "220px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {book.book_cover ? (
                          <img
                            src={book.book_cover}
                            alt={book.book_title}
                            style={{ height: "100%", width: "auto", objectFit: "contain", transition: "transform 0.3s" }}
                          />
                        ) : (
                          <BookOutlined style={{ fontSize: 48, color: "#bbb" }} />
                        )}
                      </div>
                    }
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid #f0f0f0",
                      background: "#ffffff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(201,33,39,0.2)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "#C92127";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#f0f0f0";
                    }}
                  >
                    <div style={{ padding: 0, display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                      <div>
                        <Tooltip title={book.book_title}>
                          <Text strong style={{ display: "block", fontSize: 16, marginBottom: 8, lineHeight: 1.4, height: 44, overflow: "hidden" }}>
                            {book.book_title}
                          </Text>
                        </Tooltip>
                        <Text type="secondary" style={{ display: "block", fontSize: 14, marginBottom: 8 }}>
                          {book.book_author}
                        </Text>
                        <Rate disabled value={book.rating} style={{ fontSize: 16, color: "#fadb14" }} />
                      </div>

                      <div style={{ marginTop: "auto" }}>
                        <div style={{ marginBottom: 12, textAlign: "left" }}>
                          <Text strong style={{ fontSize: 18, color: "#C92127", fontWeight: 700 }}>
                            {((book.price * (100 - book.discount_percent)) / 100).toLocaleString("vi-VN")}₫
                          </Text>
                          <br />
                          <Text delete type="secondary" style={{ fontSize: 14 }}>
                            {book.price.toLocaleString("vi-VN")}₫
                          </Text>
                          <Text style={{ fontSize: 12, color: "#C92127", marginLeft: 8, fontWeight: 600 }}>
                            -{book.discount_percent}%
                          </Text>
                        </div>


                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(book.book_id)}
                            style={{
                              flex: 1,
                              borderRadius: 6,
                              height: 36,
                              fontWeight: 500,
                              border: "1px solid #E0E0E0",
                              color: "#666",
                              fontSize: 13,
                            }}
                          >
                            Chi tiết
                          </Button>

                          <Button
                            type="primary"
                            size="small"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => handleAddToCart(book)}
                            disabled={book.stock <= 0}
                            title={book.stock <= 0 ? "Sản phẩm đã hết hàng" : ""}
                            style={{
                              flex: 1,
                              borderRadius: 6,
                              height: 36,
                              fontWeight: 500,
                              background: book.stock <= 0 ? "#d9d9d9" : "#C92127",
                              border: "none",
                              fontSize: 13,
                              cursor: book.stock <= 0 ? "not-allowed" : "pointer",
                            }}
                          >
                            {book.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
