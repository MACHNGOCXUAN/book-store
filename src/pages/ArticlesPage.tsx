import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Space,
  Tag,
  Image,
  Button,
  Input,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { API_BASE } from "../config/api";

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

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

const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (searchTitle?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url;

      if (searchTitle && searchTitle.trim()) {
        // Sử dụng search endpoint
        const params = new URLSearchParams();
        params.append("title", searchTitle.trim());
        params.append("isVisible", "true"); // Chỉ lấy bài báo hiển thị
        url = `${API_BASE}/articles?${params.toString()}`;
      } else {
        // Sử dụng /all endpoint để lấy tất cả bài báo
        url = `${API_BASE}/articles/all`;
      }

      console.log("Fetching articles from:", url);

      // Lấy token từ localStorage
      const token = localStorage.getItem("access_token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Thêm Authorization header nếu có token
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      // Xử lý các lỗi HTTP cụ thể
      if (response.status === 401) {
        setError("Bạn cần đăng nhập để xem bài báo. Vui lòng đăng nhập trước.");
        message.error("Cần đăng nhập để truy cập");
        return;
      }

      if (response.status === 403) {
        setError("Bạn không có quyền truy cập bài báo này.");
        message.error("Không có quyền truy cập");
        return;
      }

      if (response.status === 404) {
        setError("Không tìm thấy API endpoint.");
        message.error("API endpoint không tồn tại");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Backend trả về List<ArticleResponse> trực tiếp
      const articlesData = Array.isArray(data) ? data : [];

      // Lọc chỉ hiển thị những bài báo có isVisible = true
      const visibleArticles = articlesData.filter(
        (article) => article.isVisible === true
      );
      setArticles(visibleArticles);

      console.log("Total articles:", articlesData.length);
      console.log("Visible articles:", visibleArticles.length);
    } catch (err) {
      console.error("Error fetching articles:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage.includes("401")) {
        setError("Bạn cần đăng nhập để xem bài báo. Vui lòng đăng nhập trước.");
        message.error("Cần đăng nhập để truy cập");
      } else if (errorMessage.includes("403")) {
        setError("Bạn không có quyền truy cập bài báo này.");
        message.error("Không có quyền truy cập");
      } else if (errorMessage.includes("fetch")) {
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
        message.error("Lỗi kết nối server");
      } else {
        setError("Không thể tải danh sách bài báo. Vui lòng thử lại sau.");
        message.error("Lỗi khi tải bài báo");
      }

      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchArticles(value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    fetchArticles();
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const handleViewDetail = (article: Article) => {
    navigate(`/articles/${article.articleId}`);
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

  if (error) {
    const isAuthError = error.includes("đăng nhập") || error.includes("quyền");

    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
        <Title level={3} style={{ color: "#999", marginTop: 24 }}>
          {error}
        </Title>
        <Space direction="vertical" size={16}>
          {isAuthError ? (
            <Button type="primary" href="/login">
              Đăng nhập
            </Button>
          ) : (
            <Button type="primary" onClick={() => fetchArticles()}>
              Thử lại
            </Button>
          )}
        </Space>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <Title level={1} style={{ color: "#C92127", marginBottom: 16 }}>
          <BookOutlined /> Bài báo
        </Title>
        <Paragraph style={{ fontSize: 16, color: "#666" }}>
          Khám phá những bài viết hay
        </Paragraph>

        {/* Search Bar */}
        <div style={{ maxWidth: 500, margin: "0 auto", marginTop: 24 }}>
          <Input.Search
            placeholder="Tìm kiếm bài báo theo tiêu đề..."
            allowClear
            enterButton={
              <Button
                type="primary"
                icon={<SearchOutlined />}
                style={{
                  background: "#C92127",
                  borderColor: "#C92127",
                }}
              >
                Tìm kiếm
              </Button>
            }
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            style={{
              borderRadius: 8,
              border: "2px solid #C92127",
              boxShadow: "0 2px 8px rgba(201, 33, 39, 0.2)",
            }}
          />
        </div>
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
          <Title level={3} style={{ color: "#999", marginTop: 24 }}>
            Chưa có bài báo nào
          </Title>
          <Text style={{ color: "#666" }}>
            Hãy quay lại sau để đọc những bài viết mới nhất
          </Text>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {articles.map((article) => (
            <Col xs={24} sm={12} lg={8} key={article.articleId}>
              <Card
                hoverable
                style={{
                  height: "100%",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(201, 33, 39, 0.1)",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.3s ease",
                }}
                cover={
                  article.thumbnailUrl ? (
                    <Image
                      alt={article.title}
                      src={article.thumbnailUrl}
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                      }}
                      fallback="https://via.placeholder.com/400x200?text=Bài+Báo"
                      preview={false}
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        background: "linear-gradient(135deg, #C92127, #FF6B6B)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(1px)",
                        }}
                      />
                      <BookOutlined
                        style={{ fontSize: 48, color: "white", zIndex: 1 }}
                      />
                    </div>
                  )
                }
                actions={[
                  <Button
                    type="primary"
                    key="read"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(article)}
                    style={{
                      background: "#C92127",
                      borderColor: "#C92127",
                      borderRadius: 6,
                    }}
                  >
                    Đọc bài
                  </Button>,
                ]}
              >
                <Meta
                  title={
                    <Title
                      level={4}
                      style={{
                        marginBottom: 8,
                        fontSize: 16,
                        lineHeight: "1.4",
                        height: 44,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {article.title}
                    </Title>
                  }
                  description={
                    <div>
                      <Paragraph
                        style={{
                          color: "#666",
                          fontSize: 14,
                          marginBottom: 12,
                          height: 60,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {truncateContent(article.content)}
                      </Paragraph>

                      {/* Article Info */}
                      <div
                        style={{
                          borderTop: "1px solid #f0f0f0",
                          paddingTop: 8,
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={4}
                          style={{ width: "100%" }}
                        >
                          <Space
                            size={16}
                            style={{ fontSize: 12, color: "#999" }}
                          >
                            <Space size={4}>
                              <UserOutlined />
                              <span>
                                {article.createdBy || "Tác giả ẩn danh"}
                              </span>
                            </Space>
                            <Space size={4}>
                              <CalendarOutlined />
                              <span>
                                {article.createdAt &&
                                  formatDate(article.createdAt)}
                              </span>
                            </Space>
                          </Space>

                          <div style={{ marginTop: 4 }}>
                            <Tag color={article.isVisible ? "green" : "red"}>
                              {article.isVisible ? "Hiển thị" : "Ẩn"}
                            </Tag>
                            {article.updatedBy && (
                              <Tag color="blue" style={{ marginLeft: 8 }}>
                                Cập nhật bởi: {article.updatedBy}
                              </Tag>
                            )}
                          </div>
                        </Space>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ArticlesPage;
