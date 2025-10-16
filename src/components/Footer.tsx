"use client"

import type React from "react"

import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  HeartFilled,
} from "@ant-design/icons"
import { Layout, Row, Col, Space, Typography, Divider, Button } from "antd"
import { Link } from "react-router-dom"

const { Footer: AntFooter } = Layout
const { Title, Text, Paragraph } = Typography

// Matching header colors
const FOOTER_BG_COLOR = "#2C3E50"
const FOOTER_TEXT_COLOR = "#FFFFFF"
const FOOTER_TEXT_SECONDARY = "rgba(255, 255, 255, 0.65)"
const MAX_WIDTH_CONTAINER = 1200

const Footer = () => {
  const linkStyle: React.CSSProperties = {
    color: FOOTER_TEXT_SECONDARY,
    transition: "color 0.3s",
    cursor: "pointer",
  }

  const socialButtonStyle: React.CSSProperties = {
    borderRadius: 8,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  return (
    <AntFooter
      style={{
        background: FOOTER_BG_COLOR,
        color: FOOTER_TEXT_COLOR,
        padding: "48px 24px 0",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: MAX_WIDTH_CONTAINER, margin: "0 auto" }}>
        {/* Main Footer Content */}
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} lg={6}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={4} style={{ color: FOOTER_TEXT_COLOR, marginBottom: 0 }}>
                Về chúng tôi
              </Title>
              <Paragraph
                style={{
                  color: FOOTER_TEXT_SECONDARY,
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Cửa hàng sách trực tuyến hàng đầu Việt Nam, mang đến hàng ngàn đầu sách chất lượng với giá tốt nhất.
              </Paragraph>
              <Space size="middle">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<FacebookOutlined />}
                  style={socialButtonStyle}
                  href="https://facebook.com"
                  target="_blank"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<InstagramOutlined />}
                  style={socialButtonStyle}
                  href="https://instagram.com"
                  target="_blank"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<TwitterOutlined />}
                  style={socialButtonStyle}
                  href="https://twitter.com"
                  target="_blank"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<YoutubeOutlined />}
                  style={socialButtonStyle}
                  href="https://youtube.com"
                  target="_blank"
                />
              </Space>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} lg={6}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={4} style={{ color: FOOTER_TEXT_COLOR, marginBottom: 0 }}>
                Liên kết nhanh
              </Title>
              <Space direction="vertical" size="small">
                <Link to="/" style={linkStyle} className="footer-link">
                  Trang chủ
                </Link>
                <Link to="/about" style={linkStyle} className="footer-link">
                  Giới thiệu
                </Link>
                <Link to="/membership" style={linkStyle} className="footer-link">
                  Membership
                </Link>
                <Link to="/review" style={linkStyle} className="footer-link">
                  Review sách
                </Link>
                <Link to="/contact" style={linkStyle} className="footer-link">
                  Liên hệ
                </Link>
              </Space>
            </Space>
          </Col>

          {/* Categories */}
          <Col xs={24} sm={12} lg={6}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={4} style={{ color: FOOTER_TEXT_COLOR, marginBottom: 0 }}>
                Danh mục sách
              </Title>
              <Space direction="vertical" size="small">
                <Link to="/categories/van-hoc" style={linkStyle} className="footer-link">
                  Văn học
                </Link>
                <Link to="/categories/kinh-te" style={linkStyle} className="footer-link">
                  Kinh tế
                </Link>
                <Link to="/categories/ky-nang-song" style={linkStyle} className="footer-link">
                  Kỹ năng sống
                </Link>
                <Link to="/categories/thieu-nhi" style={linkStyle} className="footer-link">
                  Thiếu nhi
                </Link>
                <Link to="/categories/tam-ly" style={linkStyle} className="footer-link">
                  Tâm lý
                </Link>
              </Space>
            </Space>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} lg={6}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={4} style={{ color: FOOTER_TEXT_COLOR, marginBottom: 0 }}>
                Liên hệ
              </Title>
              <Space direction="vertical" size="small">
                <Space>
                  <EnvironmentOutlined style={{ color: FOOTER_TEXT_COLOR }} />
                  <Text style={{ color: FOOTER_TEXT_SECONDARY }}>123 Đường ABC, Quận 1, TP.HCM</Text>
                </Space>
                <Space>
                  <PhoneOutlined style={{ color: FOOTER_TEXT_COLOR }} />
                  <Text style={{ color: FOOTER_TEXT_SECONDARY }}>1900 1234</Text>
                </Space>
                <Space>
                  <MailOutlined style={{ color: FOOTER_TEXT_COLOR }} />
                  <Text style={{ color: FOOTER_TEXT_SECONDARY }}>support@bookstore.vn</Text>
                </Space>
              </Space>
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: FOOTER_TEXT_SECONDARY, fontSize: 12 }}>Thời gian làm việc:</Text>
                <br />
                <Text style={{ color: FOOTER_TEXT_COLOR, fontSize: 13 }}>T2 - T7: 8:00 - 21:00</Text>
                <br />
                <Text style={{ color: FOOTER_TEXT_COLOR, fontSize: 13 }}>CN: 9:00 - 18:00</Text>
              </div>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: "rgba(255, 255, 255, 0.15)", margin: "32px 0 24px" }} />

        {/* Bottom Bar */}
        <Row justify="space-between" align="middle" style={{ paddingBottom: 24 }}>
          <Col xs={24} md={12} style={{ textAlign: "center", marginBottom: 16 }}>
            <Text style={{ color: FOOTER_TEXT_SECONDARY, fontSize: 14 }}>© 2025 BookStore. All rights reserved.</Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "center" }}>
            <Text style={{ color: FOOTER_TEXT_SECONDARY, fontSize: 14 }}>
              Made with <HeartFilled style={{ color: "#ff4d4f", margin: "0 4px" }} /> in Vietnam
            </Text>
          </Col>
        </Row>
      </div>

      
    </AntFooter>
  )
}

export default Footer
