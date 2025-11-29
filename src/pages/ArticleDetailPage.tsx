import React, { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  message,
  Space,
  Tag,
  Image,
  Button,
  Breadcrumb,
  Card,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";

const { Title } = Typography;

interface Article {
  articleId: string;
  title: string;
  content: string;
  thumbnailUrl?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isVisible?: boolean;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE}/articles/${articleId}`;
      console.log("Fetching article from:", url);

      // Lấy token từ localStorage
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        setError("Bạn cần đăng nhập để xem bài báo này.");
        message.error("Cần đăng nhập để truy cập");
        return;
      }

      if (response.status === 404) {
        setError("Không tìm thấy bài báo này.");
        message.error("Bài báo không tồn tại");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Không thể tải bài báo. Vui lòng thử lại sau.");
      message.error("Lỗi khi tải bài báo");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleGoBack = () => {
    navigate("/articles");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
        <Title level={3} style={{ color: "#999", marginTop: 24 }}>
          {error || "Không tìm thấy bài báo"}
        </Title>
        <Space>
          <Button type="primary" onClick={handleGoBack}>
            Quay lại danh sách
          </Button>
          {error && (
            <Button onClick={() => id && fetchArticle(id)}>Thử lại</Button>
          )}
        </Space>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <Button
            type="link"
            onClick={handleGoBack}
            icon={<ArrowLeftOutlined />}
          >
            Danh sách bài báo
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Chi tiết bài báo</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        style={{
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(201, 33, 39, 0.1)",
          border: "1px solid #f0f0f0",
        }}
      >
        {/* Header với hình ảnh */}
        {article.thumbnailUrl && (
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              style={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: 12,
              }}
              fallback="https://via.placeholder.com/800x400?text=Bài+Báo"
            />
          </div>
        )}

        <div style={{ padding: "0 32px 32px" }}>
          {/* Tiêu đề */}
          <Title
            level={1}
            style={{
              color: "#C92127",
              marginBottom: 24,
              fontSize: 32,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            {article.title}
          </Title>

          {/* Thông tin meta */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
                marginBottom: 20,
              }}
            >
              {/* Tác giả */}
              <div
                style={{
                  background: "#FAFAFA",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #E8E8E8",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "#C92127",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserOutlined style={{ color: "white", fontSize: 18 }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#C92127",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Tác giả:
                  </div>
                  <div style={{ fontSize: 16, color: "#333", fontWeight: 500 }}>
                    {article.createdBy || "Hoàng Văn E"}
                  </div>
                </div>
              </div>

              {/* Ngày xuất bản */}
              <div
                style={{
                  background: "#FAFAFA",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #E8E8E8",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "#C92127",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarOutlined style={{ color: "white", fontSize: 18 }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#C92127",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Ngày xuất bản:
                  </div>
                  <div style={{ fontSize: 16, color: "#333", fontWeight: 500 }}>
                    {article.createdAt
                      ? formatDate(article.createdAt)
                      : "lúc 23:40 29 tháng 11, 2025"}
                  </div>
                </div>
              </div>
            </div>

            {/* Cập nhật và trạng thái */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {article.updatedAt && article.updatedBy && (
                <div
                  style={{
                    background: "#FAFAFA",
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid #E8E8E8",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: "#C92127",
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EditOutlined style={{ color: "white", fontSize: 18 }} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#C92127",
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      Cập nhật lần cuối:
                    </div>
                    <div
                      style={{ fontSize: 16, color: "#333", fontWeight: 500 }}
                    >
                      {formatDate(article.updatedAt)} bởi {article.updatedBy}
                    </div>
                  </div>
                </div>
              )}

              {/* Trạng thái */}
              <div
                style={{
                  background: "#FAFAFA",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #E8E8E8",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: article.isVisible ? "#52C41A" : "#FF4D4F",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EyeOutlined style={{ color: "white", fontSize: 18 }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#C92127",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Trạng thái:
                  </div>
                  <Tag
                    color={article.isVisible ? "green" : "volcano"}
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {article.isVisible ? "Công khai" : "Riêng tư"}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #C92127, transparent)",
              margin: "40px 0",
            }}
          />

          {/* Nội dung bài báo */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "32px",
              border: "1px solid #F0F0F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "#2C2C2C",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                textAlign: "justify",
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Footer actions */}
          <div
            style={{
              textAlign: "center",
              marginTop: 48,
              paddingTop: 32,
              borderTop: "1px solid #F0F0F0",
            }}
          >
            <Button
              type="primary"
              size="large"
              onClick={handleGoBack}
              icon={<ArrowLeftOutlined />}
              style={{
                background: "linear-gradient(135deg, #C92127, #E63946)",
                borderColor: "#C92127",
                borderRadius: 12,
                padding: "16px 40px",
                height: "auto",
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(201, 33, 39, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(201, 33, 39, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(201, 33, 39, 0.3)";
              }}
            >
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArticleDetailPage;
