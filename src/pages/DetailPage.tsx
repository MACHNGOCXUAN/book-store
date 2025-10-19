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
  LockOutlined,
  FileTextOutlined,
  AlertOutlined,
} from "@ant-design/icons"

import { getBookById,addCartItem } from "../lib/api.ts"
// 1. IMPORT COMPONENT REVIEW SECTION
import ReviewSection from "../components/ReviewSection.tsx" 
import { toast } from "react-toastify"

// --- INTERFACES (Cần phải được định nghĩa hoặc import nếu cần) ---
interface Book {
  bookId: string
  title: string
  author: string
  publisher: string
  category: string
  price: number
  originalPrice: number
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
  book_id: number
  customer_id: number
  customer_name: string
}
// --- END INTERFACES ---

const fakeComments: Comment[] = [
  // Dữ liệu Comment giả lập giữ nguyên
  {
    review_id: 1,
    content: "Sản phẩm rất tốt, nội dung chi tiết và dễ hiểu. Tôi rất hài lòng với chất lượng của bộ sách này.",
    rating: 5,
    rating_date: "2024-10-15",
    book_id: 10,
    customer_id: 101,
    customer_name: "Nguyễn Văn A",
  },
  {
    review_id: 2,
    content: "Bộ sách này giúp tôi cải thiện kỹ năng nghe nói rất nhiều.",
    rating: 4,
    rating_date: "2024-10-14",
    book_id: 10,
    customer_id: 102,
    customer_name: "Trần Thị B",
  },
  // ... (các comments khác)
]

function DetailPage() {
  const { id } = useParams<string>()
  const [book, setBook] = useState<Book | null>(null)
  const [comments, setComments] = useState<Comment[]>(fakeComments)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // 2. GIỮ ANTD FORM INSTANCE
  const [form] = Form.useForm() 

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await getBookById(id)
        setBook(res)
      } catch (error) {
        console.log(error)
      }
    }
    if (id) fetchBook()
  }, [id])

  // --- LOGIC TÍNH TOÁN (Được giữ lại ở đây vì nó phụ thuộc vào comments state) ---
  const ratingStats = {
    5: comments.filter((c) => c.rating === 5).length,
    4: comments.filter((c) => c.rating === 4).length,
    3: comments.filter((c) => c.rating === 3).length,
    2: comments.filter((c) => c.rating === 2).length,
    1: comments.filter((c) => c.rating === 1).length,
  }

  const totalRatings = comments.length
  const averageRating =
    totalRatings > 0 ? (comments.reduce((sum, c) => sum + c.rating, 0) / totalRatings).toFixed(1) : '0'
  // --- END LOGIC TÍNH TOÁN ---

  // 3. HÀM XỬ LÝ SUBMIT BÌNH LUẬN
  const handleCommentSubmit = (values: any) => {
    if (!isLoggedIn) {
      // Logic: Không cần làm gì nếu chưa đăng nhập (nút sẽ bị disabled hoặc ẩn)
      return
    }

    const newComment: Comment = {
      review_id: Math.max(...comments.map((c) => c.review_id), 0) + 1,
      content: values.content || values.comment, 
      rating: values.rating || 0,
      rating_date: new Date().toISOString().split("T")[0],
      book_id: book?.bookId || '10', 
      customer_id: Math.floor(Math.random() * 10000),
      customer_name: values.customer_name || "Khách hàng ẩn danh",
    }

    setComments([newComment, ...comments])
    form.resetFields()
  }
    
  // 4. HÀM XỬ LÝ ĐĂNG NHẬP/XUẤT
  const handleToggleLogin = (status: boolean) => {
      setIsLoggedIn(status);
      form.resetFields();
  }

  // Sửa lỗi: kiểm tra book trước khi render
  if (!book) return <div style={{ padding: "32px" }}>Đang tải...</div>

  const primaryColor = "rgb(207, 38, 45)"

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
        {/* Breadcrumb giữ nguyên */}
        <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0", padding: "12px 24px" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Trang chủ / NXB / NXB Khác / Compass</p>
        </div>

        {/* Main Content */}
        <Layout.Content style={{ padding: "32px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Product Section */}
            <Row gutter={[32, 32]} style={{ marginBottom: "32px" }}>
              {/* Left: Product Image */}
              <Col xs={24} lg={8}>
                <Card style={{ position: "relative" }}>
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={book.title}
                    style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                  />
                </Card>
              </Col>

              {/* Middle: Product Info */}
              <Col xs={24} lg={8}>
                <Card>
                  <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px", color: "#000" }}>
                    {book.title}
                  </h1>

                  {/* Price Section */}
                  <div style={{ marginBottom: "24px" }}>
                    <Space size="large">
                      <span style={{ textDecoration: "line-through", color: "#999", fontSize: "18px" }}>
                        {/* KIỂM TRA book.originalPrice TRƯỚC KHI GỌI toLocaleString() */}
                        {book.originalPrice?.toLocaleString() || "0"}₫ 
                      </span>
                      <span style={{ fontSize: "32px", fontWeight: "bold", color: primaryColor }}>
                        {/* KIỂM TRA book.price TRƯỚC KHI GỌI toLocaleString() */}
                        {book.price?.toLocaleString() || "0"}₫ 
                      </span>
                    </Space>
                  </div>
                  {/* Action Buttons */}
                  <Space direction="vertical" style={{ width: "100%", marginBottom: "24px" }} size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      block
                      style={{ backgroundColor: primaryColor, height: "48px", fontSize: "16px", fontWeight: "bold" }}
                      onClick={()=>{
                        addCartItem(book.bookId)
                        toast.success("Thêm vào giỏ hàng thành công")
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

                  {/* Support Info */}
                  <Card
                    style={{
                      backgroundColor: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      marginTop: "16px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                      Nếu bạn cần hỗ trợ vương mắc gì trong quá trình thanh toán xin hãy liên hệ trực tiếp qua zalo của
                      chúng tôi <span style={{ color: "#e91e63", fontWeight: "bold" }}>Zalo</span> thư viện sách tiếng
                      anh để được tư vấn nhanh nhất.
                    </p>
                  </Card>
                </Card>
              </Col>

              {/* Right: Criteria Sidebar */}
              <Col xs={24} lg={8}>
                <Card>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "24px", color: primaryColor }}>
                    Tiêu chí của chúng tôi
                  </h3>

                  <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Criteria Items */}
                    {[
                      {
                        icon: <CalendarOutlined />,
                        title: "Phiên Bản Mới Nhất",
                        desc: "Liên tục cập nhật",
                      },
                      {
                        icon: <GiftOutlined />,
                        title: "Mức Giá Phù Hợp",
                        desc: "Tiết kiệm 10 lần",
                      },
                      {
                        icon: <CalendarOutlined />,
                        title: "Sản Phẩm Nguyên Gốc",
                        desc: "Không chứa mã độc",
                      },
                      {
                        icon: <LockOutlined />,
                        title: "Tải Xuống Trực Tiếp",
                        desc: "Không phải chờ đợi",
                      },
                      {
                        icon: <CheckCircleOutlined />,
                        title: "An Toàn & Uy Tín",
                        desc: "Hơn 3.000 khách hàng",
                      },
                      {
                        icon: <CheckCircleOutlined />,
                        title: "Thanh Toán Bảo Mật",
                        desc: "Hỗ trợ hơn 28 ngân hàng",
                      },
                      {
                        icon: <LockOutlined />,
                        title: "Hỗ Trợ Kỹ Thuật",
                        desc: "Khi tải và cài đặt sản phẩm",
                      },
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

            {/* Description Section */}
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
                        <p>
                          Bộ sách <em>Integrate Listening & Speaking: Basic Building</em> là tài liệu học tiếng Anh cấp
                          độ cơ bản, được thiết kế để giúp người học phát triển động thời kỹ năng nghe và nói trong các
                          tình huống giao tiếp thực tế. Đây là bộ sách lý tưởng dành cho những người mới học hoặc những
                          ai muốn cung cấp nền tảng chắc chắn cho việc phát triển kỹ năng giao tiếp tiếng Anh.
                        </p>
                        <h3 style={{ fontWeight: "bold", marginTop: "24px", marginBottom: "12px" }}>
                          Cấu trúc của bộ sách:
                        </h3>
                        <ol style={{ paddingLeft: "20px" }}>
                          <li style={{ marginBottom: "12px" }}>
                            <strong>Mục tiêu cấp độ:</strong> Bộ sách thuộc cấp độ Basic, phù hợp với người học ở trình
                            độ sơ cấp, giúp xây dựng nền tảng vững chắc cho việc phát triển kỹ năng giao tiếp tiếng Anh.
                          </li>
                          <li>
                            <strong>Cấu trúc từng bài học:</strong> Các bài học được thiết kế đơn giản, dễ hiểu với
                            trong tâm vào các tình huống giao tiếp hàng ngày.
                          </li>
                        </ol>
                      </div>
                    ),
                  },
                  {
                    key: "notes",
                    label: (
                      <span>
                        <AlertOutlined style={{ marginRight: "8px" }} />
                        Lưu ý trước khi mua
                      </span>
                    ),
                    children: (
                      <div style={{ color: "#333", lineHeight: "1.6" }}>
                        <p>Trước khi mua sản phẩm này, vui lòng lưu ý những điều sau:</p>
                        <ul style={{ paddingLeft: "20px" }}>
                          <li>Đây là sản phẩm kỹ thuật số, không phải bản in</li>
                          <li>Sau khi thanh toán, bạn sẽ nhận được link tải xuống</li>
                          <li>Sản phẩm không hỗ trợ hoàn tiền sau khi tải xuống</li>
                          <li>Vui lòng kiểm tra tính tương thích với thiết bị của bạn</li>
                        </ul>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            {/* 5. TÍCH HỢP COMPONENT REVIEW SECTION */}
            <ReviewSection
              bookTitle={book.title}
              ratingStats={ratingStats}
              totalRatings={totalRatings}
              averageRating={averageRating}
              primaryColor={primaryColor}
              
              // Truyền trạng thái và dữ liệu tương tác
              comments={comments}
              isLoggedIn={isLoggedIn}
              form={form}
              onCommentSubmit={handleCommentSubmit}
              onToggleLogin={handleToggleLogin}
            />
            {/* END OF REVIEW SECTION */}

          </div>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}

export default DetailPage