import { ClockCircleOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'

const { Title, Paragraph, Text } = Typography

interface ChatMessage {
  messageId: string
  sender: {
    userId: string
    fullName: string
    email?: string
  }
  receiver: {
    userId: string
    fullName: string
    email?: string
  }
  content: string
  timestamp: Date
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE'
  fileUrl?: string
  fileName?: string
  fileSize?: string
  isRead: boolean
  chatSessionId?: string
}

const ContactPage = () => {
  const [form] = Form.useForm()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      messageId: '1',
      sender: {
        userId: 'staff-1',
        fullName: 'Nhân viên hỗ trợ',
        email: 'support@bookstore.vn'
      },
      receiver: {
        userId: 'customer-1',
        fullName: 'Bạn',
        email: ''
      },
      content: 'Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?',
      timestamp: new Date(Date.now() - 60000),
      messageType: 'TEXT',
      isRead: true,
      chatSessionId: 'session-1'
    },
    {
      messageId: '2',
      sender: {
        userId: 'staff-1',
        fullName: 'Nhân viên hỗ trợ',
        email: 'support@bookstore.vn'
      },
      receiver: {
        userId: 'customer-1',
        fullName: 'Bạn',
        email: ''
      },
      content: 'Vui lòng cho biết câu hỏi hoặc vấn đề của bạn.',
      timestamp: new Date(Date.now() - 30000),
      messageType: 'TEXT',
      isRead: true,
      chatSessionId: 'session-1'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Assume current user is customer
    const currentUserId = 'customer-1'
    const staffId = 'staff-1'

    const newMessage: ChatMessage = {
      messageId: String(messages.length + 1),
      sender: {
        userId: currentUserId,
        fullName: 'Bạn',
        email: ''
      },
      receiver: {
        userId: staffId,
        fullName: 'Nhân viên hỗ trợ',
        email: 'support@bookstore.vn'
      },
      content: inputMessage,
      timestamp: new Date(),
      messageType: 'TEXT',
      isRead: false,
      chatSessionId: 'session-1'
    }

    setMessages([...messages, newMessage])
    setInputMessage('')

    // Simulate staff response after 1 second
    setTimeout(() => {
      const staffResponse: ChatMessage = {
        messageId: String(messages.length + 2),
        sender: {
          userId: staffId,
          fullName: 'Nhân viên hỗ trợ',
          email: 'support@bookstore.vn'
        },
        receiver: {
          userId: currentUserId,
          fullName: 'Bạn',
          email: ''
        },
        content: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất.',
        timestamp: new Date(),
        messageType: 'TEXT',
        isRead: false,
        chatSessionId: 'session-1'
      }
      setMessages(prev => [...prev, staffResponse])
    }, 1000)
  }

  const onFinish = () => {


    const recipient = "support@bookstore.vn";
    const mailBody = encodeURIComponent(
      `Xin chào BookStore.`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&body=${mailBody}`;
    window.open(gmailUrl, "_blank");

    form.resetFields();
  };

  return (
    <div style={{ background: 'linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%)' }}>
      {/* Hero Section */}
      <div
        style={{

          padding: '80px 16px',
          textAlign: 'center',
          color: 'black',
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={1} style={{ color: 'black', fontSize: '2.5rem', marginBottom: 16 }}>
            📞 Liên hệ với chúng tôi
          </Title>
          <Paragraph style={{ color: 'black', fontSize: '1.1rem', opacity: 0.95 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space align="start" size="middle" style={{ flex: 1 }}>
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
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => window.open('https://maps.app.goo.gl/jnQTBGxv6Nvw6fBg9', '_blank')}
                    style={{
                      background: '#C92127',
                      border: 'none',
                      padding: 15
                    }}
                  >
                    Xem
                  </Button>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space align="start" size="middle" style={{ flex: 1 }}>
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
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => onFinish()}
                    style={{
                      background: '#06A77D',
                      border: 'none',
                      padding: 15
                    }}
                  >
                    Gửi
                  </Button>
                </div>
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

          {/* Contact Form - Chat Style */}
          <Col xs={24} lg={14}>
            <Card
              style={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                height: '670',
                overflow: 'hidden',
              }}
            >
              <Title level={3} style={{ marginBottom: 16, flexShrink: 0 }}>
                💬 Chat với chúng tôi
              </Title>

              {/* Chat Messages Container */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  height: '530px'
                }}
              >
                {messages.map((msg) => {
                  const isCustomer = msg.sender.userId === 'customer-1'
                  return (
                    <div
                      key={msg.messageId}
                      style={{
                        display: 'flex',
                        justifyContent: isCustomer ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isCustomer ? '#C92127' : '#e8e8e8',
                          color: isCustomer ? 'white' : '#333',
                          wordWrap: 'break-word',
                        }}
                      >
                        {!isCustomer && (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              marginBottom: '4px',
                              opacity: 0.8,
                            }}
                          >
                            {msg.sender.fullName}
                          </div>
                        )}
                        <div style={{ fontSize: '14px' }}>{msg.content}</div>
                        <div
                          style={{
                            fontSize: '11px',
                            marginTop: '4px',
                            opacity: 0.7,
                          }}
                        >
                          {msg.timestamp.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Input
                  placeholder="Nhập tin nhắn của bạn..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  style={{ borderRadius: '8px' }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  style={{
                    background: '#C92127',
                    border: 'none',
                    flexShrink: 0,
                  }}
                >
                  Gửi
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Map Section */}
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
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9297.065500216604!2d106.6881264!3d10.8227216!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e1!3m2!1svi!2s!4v1762851361205!5m2!1svi!2s"
                width="100%"
                height="450"
                style={{ border: 0, maxWidth: '100%', display: 'block' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ContactPage