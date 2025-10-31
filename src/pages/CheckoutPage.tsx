import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Card,
  Radio,
  Button,
  Divider,
  Row,
  Col,
  Typography,
  List,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { CartItem, type CartItemType } from "../components/CartItem";
import momoIcon from "../components/icons/logo-momo.png";
import zalopayIcon from "../components/icons/logo-zalo-tron.jpg";
import vnpayIcon from "../components/icons/logo-vnpay.jpg";

const { Title, Text } = Typography;

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    if (location.state?.items) {
      setCartItems(location.state.items);
    }
  }, [location.state]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 20000;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    navigate("/order-success");
  };

  return (
    <div
      style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 120 }}
    >
      <Card
        style={{
          margin: 24,
          backgroundColor: "#eaf3ff",
          borderColor: "#91caff",
        }}
      >
        <Text>
          <strong>Quý khách</strong> vui lòng sử dụng địa chỉ giao hàng trước{" "}
          <strong>01/07/2025</strong> để đặt hàng. Fahasa.com sẽ thông báo cập
          nhật địa chỉ mới ngay khi hoàn tất hệ thống.
        </Text>
      </Card>

      <Card title="ĐỊA CHỈ GIAO HÀNG" style={{ margin: 24 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Họ và tên người nhận">
                <Input placeholder="Nhập họ và tên người nhận" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số điện thoại">
                <Input value="0869192776" readOnly />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Quốc gia">
                <Select
                  defaultValue="Việt Nam"
                  options={[{ value: "Việt Nam" }]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tỉnh/Thành phố">
                <Select placeholder="Chọn tỉnh/thành phố" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Quận/Huyện">
                <Select placeholder="Chọn quận/huyện" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phường/Xã">
                <Select placeholder="Chọn phường/xã" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Địa chỉ nhận hàng">
            <Input placeholder="Nhập địa chỉ nhận hàng" />
          </Form.Item>
        </Form>
      </Card>

      {/* PHƯƠNG THỨC THANH TOÁN */}
      <Card title="PHƯƠNG THỨC THANH TOÁN" style={{ margin: 24 }}>
        <Radio.Group defaultValue="cod" style={{ width: "100%" }}>
          <Row gutter={[0, 12]}>
            <Col span={24}>
              <Radio value="zalopay">
                <img
                  src={zalopayIcon}
                  alt="ZaloPay"
                  width={28}
                  style={{ marginRight: 8, verticalAlign: "middle" }}
                />
                Ví ZaloPay
              </Radio>
            </Col>

            <Col span={24}>
              <Radio value="vnpay">
                <img
                  src={vnpayIcon}
                  alt="VNPAY"
                  width={28}
                  style={{ marginRight: 8, verticalAlign: "middle" }}
                />
                VNPAY
              </Radio>
            </Col>

            <Col span={24}>
              <Radio value="momo">
                <img
                  src={momoIcon}
                  alt="MoMo"
                  width={28}
                  style={{ marginRight: 8, verticalAlign: "middle" }}
                />
                Ví MoMo
              </Radio>
            </Col>

            <Col span={24}>
              <Radio value="cod">
                <img
                  src="https://cdn0.fahasa.com/media/wysiwyg/payment_icon/ico_deli_payment.svg"
                  alt="COD"
                  width={28}
                  style={{ marginRight: 8, verticalAlign: "middle" }}
                />
                Thanh toán khi nhận hàng (COD)
              </Radio>
            </Col>
          </Row>
        </Radio.Group>
      </Card>

      {/* THÀNH VIÊN FAHASA */}
      <Card title="THÀNH VIÊN FAHASA" style={{ margin: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <Text>
            Số F-Point hiện có: <strong>0</strong>
          </Text>
          <div style={{ marginTop: 8 }}>
            <Checkbox>Dùng 0 ₫ F-Point để thanh toán</Checkbox>
          </div>
        </div>
        <div>
          <Text>
            Số lần freeship: <strong>0 lần</strong>
          </Text>
          <div style={{ marginTop: 8 }}>
            <Checkbox>Sử dụng freeship</Checkbox>
          </div>
        </div>
      </Card>

      {/* MÃ KHUYẾN MÃI / GIFT CARD */}
      <Card title="MÃ KHUYẾN MÃI / GIFT CARD" style={{ margin: 24 }}>
        <Row gutter={8}>
          <Col flex="auto">
            <Input placeholder="Nhập mã khuyến mãi / Gift Card" />
          </Col>
          <Col>
            <Button type="primary">Áp dụng</Button>
          </Col>
          <Col>
            <Button type="link">Chọn mã khuyến mãi</Button>
          </Col>
        </Row>
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          Hướng dẫn sử dụng Gift Card <InfoCircleOutlined />
        </Text>
      </Card>

      {/* NHẬN QUÀ */}
      <div
        style={{
          margin: "24px",
          background: "linear-gradient(to right, #eef1ff, #ffffff)",
          borderRadius: 8,
          padding: "16px 20px",
          border: "1px solid #d9e1ff",
        }}
      >
        <Text>
          🎁 <strong>Nhận quà</strong> — Đơn hàng của bạn chưa đủ điều kiện nhận
          quà.
        </Text>
        <Button type="link" style={{ marginLeft: 4, padding: 0 }}>
          Chọn quà
        </Button>
      </div>

      {/* THÔNG TIN KHÁC */}
      <Card title="THÔNG TIN KHÁC" style={{ margin: 24 }}>
        <Checkbox style={{ display: "block", marginBottom: 8 }}>
          Ghi chú
        </Checkbox>
        <Checkbox>
          Xuất hóa đơn GTGT <Button type="link">Chi tiết</Button>
        </Checkbox>
        <Text type="danger" style={{ display: "block", marginTop: 8 }}>
          *Từ ngày 01/11/2020, Công ty Fahasa không giải quyết việc xuất lại hóa
          đơn cho các trường hợp Quý khách không đăng ký thông tin.
        </Text>
      </Card>

      <Card title="KIỂM TRA LẠI ĐƠN HÀNG" style={{ margin: 24 }}>
        <List
          dataSource={cartItems}
          renderItem={(item) => (
            <List.Item>
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <img
                  src={item.image || "/default-book.png"}
                  alt={item.title}
                  width={60}
                  height={60}
                  style={{
                    borderRadius: 6,
                    objectFit: "cover",
                    background: "#f5f5f5",
                    marginRight: 12,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Text strong>{item.title}</Text>
                  <br />
                  <Text type="secondary">Tác giả: {item.author}</Text>
                  <br />
                  <Text type="secondary">Số lượng: {item.quantity}</Text>
                </div>
                <Text strong style={{ color: "#d32f2f" }}>
                  {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                </Text>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Thành tiền</Text>
          <Text>{subtotal.toLocaleString("vi-VN")} ₫</Text>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Phí vận chuyển</Text>
          <Text>{shipping.toLocaleString("vi-VN")} ₫</Text>
        </div>

        <Divider />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={5}>Tổng số tiền (gồm VAT)</Title>
          <Title level={5} type="danger">
            {total.toLocaleString("vi-VN")} ₫
          </Title>
        </div>
      </Card>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #eee",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 220,
            }}
          >
            <Text strong>Tổng cộng:</Text>
            <Text strong style={{ color: "#d32f2f" }}>
              {total.toLocaleString("vi-VN")} ₫
            </Text>
          </div>
          <Text type="secondary">(Đã bao gồm VAT)</Text>
        </div>

        <Button
          type="primary"
          size="large"
          onClick={handleCheckout}
          style={{
            background: "linear-gradient(180deg,#d83b3b,#b72222)",
            border: "none",
            fontWeight: 600,
            padding: "0 32px",
            height: 48,
            borderRadius: 6,
          }}
        >
          Xác nhận thanh toán
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
