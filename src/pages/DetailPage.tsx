import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Layout,
  Row,
  Col,
  Button,
  Tabs,
  Card,
  Space,
  ConfigProvider,
  Form
} from "antd"
import {
  ShoppingCartOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons"
import { getBookById, addCartItem } from "../lib/api.ts"
import ReviewSection from "../components/ReviewSection.tsx" 
import { toast } from "react-toastify"

interface Book {
  bookId: string
  title: string
  author: string
  publisher: string
  category: string
  price: number
  stock: number
  description: string
  publishDate: string
  coverImage: string
  discount: number
}

interface Comment {
  review_id: number
  content: string
  rating: number
  rating_date: string
  book_id: string
  customer_id: number
  customer_name: string
}

const fakeComments: Comment[] = [
  {
    review_id: 1,
    content: "Sản phẩm rất tốt, nội dung chi tiết và dễ hiểu. Tôi rất hài lòng với chất lượng của bộ sách này.",
    rating: 5,
    rating_date: "2024-10-15",
    book_id: "B001",
    customer_id: 101,
    customer_name: "Nguyễn Văn A",
  },
  {
    review_id: 2,
    content: "Bộ sách này giúp tôi cải thiện kỹ năng nghe nói rất nhiều.",
    rating: 4,
    rating_date: "2024-10-14",
    book_id: "B001",
    customer_id: 102,
    customer_name: "Trần Thị B",
  },
]

function DetailPage() {
  const { id } = useParams<string>()
  const [book, setBook] = useState<Book | null>(null)
  const [comments, setComments] = useState<Comment[]>(fakeComments)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [form] = Form.useForm()

  // async function handleAddToCart() {
  //   addCartItem(book.bookId)
  //   try {
  //       await dispatch(addOrUpdateCartItem({ bookId: String(book?.bookId), quantity: delta })).unwrap();
  //       } catch (e) {
  //         console.log(e)
  //       }
  //       }
  //         await dispatch(fetchCart()).unwrap();
  //       try { window.dispatchEvent(new CustomEvent('cart-updated')); } catch (e) {}
  //       toast.success("Thêm vào giỏ hàng thành công")    
  // }

  const handleAddToCart = async () => {
  try {
    if(id) {
      await addCartItem(id)
      toast.success("Đã thêm vào giỏ hàng 🎉");
      // 🔥 Gửi tín hiệu toàn cục cho Header biết là giỏ hàng đã thay đổi
      window.dispatchEvent(new CustomEvent("cart-updated"));
    }

  } catch (error) {
    console.log(error)
    toast.error("Lỗi khi thêm sản phẩm 😢");
  }
};
 
  useEffect(() => {
    async function fetchBook() {
      try {
        if(id) {
          const res = await getBookById(id)
          setBook(res)
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (id) fetchBook()
  }, [id])

  const ratingStats = {
    5: comments.filter((c) => c.rating === 5).length,
    4: comments.filter((c) => c.rating === 4).length,
    3: comments.filter((c) => c.rating === 3).length,
    2: comments.filter((c) => c.rating === 2).length,
    1: comments.filter((c) => c.rating === 1).length,
  }

  const totalRatings = comments.length
  const averageRating =
    totalRatings > 0 ? (comments.reduce((sum, c) => sum + c.rating, 0) / totalRatings).toFixed(1) : "0"

  const handleCommentSubmit = (values: any) => {
    if (!isLoggedIn) return

    const newComment: Comment = {
      review_id: Math.max(...comments.map((c) => c.review_id), 0) + 1,
      content: values.content || values.comment,
      rating: values.rating || 0,
      rating_date: new Date().toISOString().split("T")[0],
      book_id: book?.bookId || "unknown",
      customer_id: Math.floor(Math.random() * 10000),
      customer_name: values.customer_name || "Khách hàng ẩn danh",
    }

    setComments([newComment, ...comments])
    form.resetFields()
  }

  const handleToggleLogin = (status: boolean) => {
    setIsLoggedIn(status)
    form.resetFields()
  }

  if (!book) return <div style={{ padding: "32px" }}>Đang tải...</div>

  const primaryColor = "rgb(207, 38, 45)"
  const originalPrice = book.discount ? book.price / (1 - book.discount / 100) : book.price

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0", padding: "12px 24px" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Trang chủ / {book.category} / {book.publisher}</p>
        </div>

        <Layout.Content style={{ padding: "32px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Row gutter={[32, 32]} style={{ marginBottom: "32px" }}>
              <Col xs={24} lg={8}>
                <Card style={{ position: "relative" }}>
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={book.title}
                    style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card>
                  <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px", color: "#000" }}>
                    {book.title}
                  </h1>

                  <div style={{ marginBottom: "24px" }}>
                    <Space size="large">
                      <span style={{ textDecoration: "line-through", color: "#999", fontSize: "18px" }}>
                        {originalPrice.toLocaleString()}₫
                      </span>
                      <span style={{ fontSize: "32px", fontWeight: "bold", color: primaryColor }}>
                        {book.price.toLocaleString()}₫
                      </span>
                    </Space>
                  </div>

                  <Space direction="vertical" style={{ width: "100%", marginBottom: "24px" }} size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      block
                      style={{ backgroundColor: primaryColor, height: "48px", fontSize: "16px", fontWeight: "bold" }}
                      onClick={() => {
                        handleAddToCart()
                      }}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                    <Button
                      size="large"
                      icon={<CreditCardOutlined />}
                      block
                      style={{
                        backgroundColor: "#e91e63",
                        color: "#fff",
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        border: "none",
                      }}
                    >
                      Thanh toán ngay
                    </Button>
                  </Space>

                  <Card
                    style={{
                      backgroundColor: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      marginTop: "16px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                      Nếu bạn cần hỗ trợ trong quá trình thanh toán, xin hãy liên hệ qua{" "}
                      <span style={{ color: "#e91e63", fontWeight: "bold" }}>Zalo</span> để được tư vấn nhanh nhất.
                    </p>
                  </Card>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "24px", color: primaryColor }}>
                    Tiêu chí của chúng tôi
                  </h3>
                  <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {[
                      { icon: <CalendarOutlined />, title: "Phiên bản mới nhất", desc: "Liên tục cập nhật" },
                      { icon: <GiftOutlined />, title: "Mức giá phù hợp", desc: "Tiết kiệm hơn 10 lần" },
                      { icon: <CheckCircleOutlined />, title: "An toàn & Uy tín", desc: "Hơn 3.000 khách hàng" },
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "12px" }}>
                        <div style={{ fontSize: "24px", color: "#999", flexShrink: 0 }}>{item.icon}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: "bold", color: "#000" }}>{item.title}</p>
                          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#666" }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card style={{ marginBottom: 30 }}>
              <Tabs
                items={[
                  {
                    key: "description",
                    label: (
                      <span>
                        <FileTextOutlined style={{ marginRight: "8px" }} />
                        Mô tả
                      </span>
                    ),
                    children: (
                      <div style={{ color: "#333", lineHeight: "1.6" }}>
                        <p>{book.description}</p>
                        <p><strong>Tác giả:</strong> {book.author}</p>
                        <p><strong>Nhà xuất bản:</strong> {book.publisher}</p>
                        <p><strong>Ngày xuất bản:</strong> {book.publishDate}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            <ReviewSection
              bookTitle={book.title}
              ratingStats={ratingStats}
              totalRatings={totalRatings}
              averageRating={averageRating}
              primaryColor={primaryColor}
              comments={comments}
              isLoggedIn={isLoggedIn}
              form={form}
              onCommentSubmit={handleCommentSubmit}
              onToggleLogin={handleToggleLogin}
            />
          </div>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}

export default DetailPage
