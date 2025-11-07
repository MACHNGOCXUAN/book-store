// src/components/ReviewPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, Rate, Typography, Row, Col, Spin, Tooltip } from "antd";
import { motion } from "framer-motion";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface Review {
  review_id: string;
  rating: number;
  content: string;
  rating_date: string;
  book_id: string;
  book_title: string;
  book_cover?: string;
  customer_name: string;
}

// ==== CSS STYLE OBJECTS ====
const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #f0f0f0",
  background: "#ffffff",
};

const cardHover = {
  boxShadow: "0 8px 20px rgba(201,33,39,0.2)",
  transform: "translateY(-4px)",
  borderColor: "#C92127",
};

const coverContainer: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  backgroundColor: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 220,
  margin: 0,         
  width: "calc(100% + 2px)", 
  marginLeft: "-1px", 
  borderBottom: "1px solid #f0f0f0",
  padding: 0,        
};


const cardBody: React.CSSProperties = {
  padding: 16,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const titleStyle: React.CSSProperties = {
  display: "block",
  fontSize: 16,
  marginBottom: 8,
  lineHeight: 1.4,
  height: 44,
  overflow: "hidden",
};

const customerStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  marginBottom: 16,
};

const contentStyle: React.CSSProperties = {
  marginTop: 8,
  color: "#555",
};

const dateStyle: React.CSSProperties = {
  fontSize: 12,
};

const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState<Review[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/reviews");
        if (!res.ok) throw new Error("Không thể tải dữ liệu review");
        const data = await res.json();
        setReviews(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    const q = value.toLowerCase();
    setFiltered(
      reviews.filter(
        (r) =>
          r.book_title.toLowerCase().includes(q) ||
          r.customer_name.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q)
      )
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin tip="Đang tải review..." size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Title level={2} style={{ textAlign: "center", color: "#333" }}>
            📚 Cộng đồng Review Sách
          </Title>
          <Text style={{ display: "block", textAlign: "center", color: "#666", marginBottom: 30 }}>
            Cảm nhận chân thực từ độc giả về các cuốn sách yêu thích
          </Text>
        </motion.div>

        {filtered.length === 0 ? (
          <Text type="secondary" style={{ display: "block", textAlign: "center" }}>
            Không có review nào phù hợp 😢
          </Text>
        ) : (
          <Row gutter={[24, 32]}>
            {filtered.map((review, i) => (
              <Col key={review.review_id} xs={12} sm={12} md={8} lg={6}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    hoverable
                    style={cardStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
                    onMouseLeave={(e) =>
                      Object.assign(e.currentTarget.style, {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transform: "translateY(0)",
                        borderColor: "#f0f0f0",
                      })
                    }
                  >
                    <div style={coverContainer}>
                      {review.book_cover ? (
                        <img
                          src={review.book_cover}
                          alt={review.book_title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", 
                            transition: "transform 0.3s ease",
                          }}
                        />

                      ) : (
                        <BookOutlined style={{ fontSize: 48, color: "#bbb" }} />
                      )}
                    </div>

                    <div style={cardBody}>
                      <div>
                        <Tooltip title={review.book_title}>
                          <Text strong style={titleStyle}>
                            {review.book_title}
                          </Text>
                        </Tooltip>
                        <Text style={customerStyle}>{review.customer_name}</Text>
                      </div>

                      <div>
                        <Rate disabled value={review.rating} />
                        <Paragraph ellipsis={{ rows: 3 }} style={contentStyle}>
                          “{review.content || "Chưa có đánh giá"}”
                        </Paragraph>
                        <Text type="secondary" style={dateStyle}>
                          {review.rating_date
                            ? new Date(review.rating_date + "T00:00:00").toLocaleDateString("vi-VN")
                            : ""}
                        </Text>
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
