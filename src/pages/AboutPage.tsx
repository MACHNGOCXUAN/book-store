import { CheckCircleOutlined, HeartOutlined, RocketOutlined, TrophyOutlined } from '@ant-design/icons'
import { Card, Col, Row, Timeline, Typography } from 'antd'

const { Title, Paragraph } = Typography

const AboutPage = () => {
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
            🌟 Về chúng tôi
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '1.1rem', opacity: 0.95 }}>
            Câu chuyện về hành trình mang tri thức đến gần hơn với mọi người
          </Paragraph>
        </div>
      </div>

      {/* Story Section */}
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 16px' }}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={2} style={{ color: '#2c3e50', marginBottom: 24 }}>
              Câu chuyện của chúng tôi
            </Title>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              BookStore được thành lập vào năm 2020 với sứ mệnh mang đến cho người đọc Việt Nam
              một nền tảng mua sắm sách trực tuyến hiện đại, tiện lợi và đáng tin cậy nhất.
            </Paragraph>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
              Chúng tôi tin rằng tri thức là chìa khóa mở ra cánh cửa tương lai, và mỗi cuốn sách
              là một hành trình khám phá mới. Với hàng ngàn đầu sách từ nhiều thể loại khác nhau,
              chúng tôi cam kết đem đến trải nghiệm mua sắm tốt nhất cho khách hàng.
            </Paragraph>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
              Hơn 100,000 khách hàng đã tin tưởng và lựa chọn BookStore là người bạn đồng hành
              trong hành trình khám phá tri thức của mình.
            </Paragraph>
          </Col>
          <Col xs={24} lg={12}>
            <div
              style={{
                background: 'linear-gradient(135deg, #C92127 0%, #E63946 100%)',
                borderRadius: 16,
                padding: 40,
                color: 'white',
                boxShadow: '0 10px 30px rgba(201,33,39,0.3)',
              }}
            >
              <Timeline
                mode="left"
                items={[
                  {
                    dot: <RocketOutlined style={{ fontSize: 20 }} />,
                    children: (
                      <>
                        <Title level={4} style={{ color: 'white', margin: 0 }}>2020</Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                          Thành lập BookStore
                        </Paragraph>
                      </>
                    ),
                  },
                  {
                    dot: <TrophyOutlined style={{ fontSize: 20 }} />,
                    children: (
                      <>
                        <Title level={4} style={{ color: 'white', margin: 0 }}>2022</Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                          Đạt 50,000 khách hàng
                        </Paragraph>
                      </>
                    ),
                  },
                  {
                    dot: <HeartOutlined style={{ fontSize: 20 }} />,
                    children: (
                      <>
                        <Title level={4} style={{ color: 'white', margin: 0 }}>2024</Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                          Mở rộng toàn quốc
                        </Paragraph>
                      </>
                    ),
                  },
                  {
                    dot: <CheckCircleOutlined style={{ fontSize: 20 }} />,
                    children: (
                      <>
                        <Title level={4} style={{ color: 'white', margin: 0 }}>2025</Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                          Hơn 100,000 khách hàng tin dùng
                        </Paragraph>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Values Section */}
      <div style={{ background: '#FFF5F5', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48, color: '#C92127' }}>
            Giá trị cốt lõi
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 16,
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 48, color: '#C92127', marginBottom: 16 }} />
                <Title level={4}>Chất lượng</Title>
                <Paragraph type="secondary">
                  Cam kết 100% sách chính hãng, nguồn gốc rõ ràng
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 16,
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <HeartOutlined style={{ fontSize: 48, color: '#FF6B35', marginBottom: 16 }} />
                <Title level={4}>Tận tâm</Title>
                <Paragraph type="secondary">
                  Luôn lắng nghe và phục vụ khách hàng với trái tim
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 16,
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <RocketOutlined style={{ fontSize: 48, color: '#F77F00', marginBottom: 16 }} />
                <Title level={4}>Đổi mới</Title>
                <Paragraph type="secondary">
                  Không ngừng cải tiến để mang đến trải nghiệm tốt nhất
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 16,
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <TrophyOutlined style={{ fontSize: 48, color: '#06A77D', marginBottom: 16 }} />
                <Title level={4}>Uy tín</Title>
                <Paragraph type="secondary">
                  Xây dựng niềm tin qua từng sản phẩm, dịch vụ
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 16px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={12} sm={6}>
            <Card style={{ textAlign: 'center', borderRadius: 16, border: '2px solid #C92127' }}>
              <Title level={2} style={{ color: '#C92127', marginBottom: 8 }}>100K+</Title>
              <Paragraph style={{ margin: 0, fontWeight: 600 }}>Khách hàng</Paragraph>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ textAlign: 'center', borderRadius: 16, border: '2px solid #FF6B35' }}>
              <Title level={2} style={{ color: '#FF6B35', marginBottom: 8 }}>10K+</Title>
              <Paragraph style={{ margin: 0, fontWeight: 600 }}>Đầu sách</Paragraph>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ textAlign: 'center', borderRadius: 16, border: '2px solid #F77F00' }}>
              <Title level={2} style={{ color: '#F77F00', marginBottom: 8 }}>5</Title>
              <Paragraph style={{ margin: 0, fontWeight: 600 }}>Năm kinh nghiệm</Paragraph>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ textAlign: 'center', borderRadius: 16, border: '2px solid #06A77D' }}>
              <Title level={2} style={{ color: '#06A77D', marginBottom: 8 }}>99%</Title>
              <Paragraph style={{ margin: 0, fontWeight: 600 }}>Hài lòng</Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default AboutPage