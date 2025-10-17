import { ClockCircleOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Row, Space, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const ContactPage = () => {
  const [form] = Form.useForm()

  const onFinish = (values: unknown) => {
    console.log('Form values:', values)
    // Handle form submission here
    form.resetFields()
  }

  return (
    <div style={{ background: 'linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%)' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #C92127 0%, #E63946 100%)',
          padding: '80px 16px',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', fontSize: '2.5rem', marginBottom: 16 }}>
            📞 Liên hệ với chúng tôi
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '1.1rem', opacity: 0.95 }}>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </Paragraph>
        </div>
      </div>

      {/* Contact Content */}
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 16px' }}>
        <Row gutter={[48, 48]}>
          {/* Contact Information */}
          <Col xs={24} lg={10}>
            <Title level={2} style={{ color: '#2c3e50', marginBottom: 24 }}>
              Thông tin liên hệ
            </Title>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
              Hãy liên hệ với chúng tôi qua các kênh dưới đây hoặc điền vào form bên cạnh.
              Đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm nhất!
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                <Space align="start" size="middle">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #C92127 0%, #E63946 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EnvironmentOutlined style={{ fontSize: 24, color: 'white' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                      Địa chỉ
                    </Text>
                    <Text type="secondary">123 Đường ABC, Quận 1, TP.HCM</Text>
                  </div>
                </Space>
              </Card>

              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                <Space align="start" size="middle">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #FF6B35 0%, #F77F00 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneOutlined style={{ fontSize: 24, color: 'white' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                      Số điện thoại
                    </Text>
                    <Text type="secondary">1900 1234 (8:00 - 21:00)</Text>
                  </div>
                </Space>
              </Card>

              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                <Space align="start" size="middle">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #06A77D 0%, #028174 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MailOutlined style={{ fontSize: 24, color: 'white' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                      Email
                    </Text>
                    <Text type="secondary">support@bookstore.vn</Text>
                  </div>
                </Space>
              </Card>

              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                <Space align="start" size="middle">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #F77F00 0%, #FCBF49 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ClockCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                      Giờ làm việc
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                      T2 - T7: 8:00 - 21:00
                    </Text>
                    <Text type="secondary">CN: 9:00 - 18:00</Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              }}
            >
              <Title level={3} style={{ marginBottom: 24 }}>
                Gửi tin nhắn cho chúng tôi
              </Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input placeholder="example@email.com" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input placeholder="0123456789" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Tiêu đề"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                >
                  <Input placeholder="Tiêu đề tin nhắn" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Nội dung"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SendOutlined />}
                    block
                    style={{
                      height: 50,
                      borderRadius: 10,
                      background: '#C92127',
                      border: 'none',
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    Gửi tin nhắn
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Map Section (Optional - placeholder) */}
      <div style={{ background: '#f5f7fa', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <Card
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              border: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                height: 400,
                background: 'linear-gradient(135deg, #C92127 0%, #E63946 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <EnvironmentOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <Title level={3} style={{ color: 'white', marginBottom: 8 }}>
                  Bản đồ
                </Title>
                <Text style={{ color: 'white', opacity: 0.9 }}>
                  123 Đường ABC, Quận 1, TP.HCM
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ContactPage