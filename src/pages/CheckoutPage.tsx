import React, { useEffect, useState, useMemo } from "react";
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
  Spin,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "antd";
import { InfoCircleOutlined, EditOutlined } from "@ant-design/icons"; // Thêm EditOutlined
import { type CartItemType } from "../components/CartItem";
import momoIcon from "../components/icons/logo-momo.png";
import vnpayIcon from "../components/icons/logo-vnpay.jpg";
import { addressService } from "../services/addressService";
import { useAppSelector } from "../hooks/hooks";
import type { Address } from "../types/Address";
import { fetchProvincesV1, transformV1Data } from "../services/provincesApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Giả định Type cho dữ liệu địa chỉ (Tỉnh -> Quận/Huyện -> [Phường/Xã])
type ProvinceData = Record<string, Record<string, string[]>>;

const CheckoutPage: React.FC = () => {
  const authUser = useAppSelector((s) => s.auth.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [showNote, setShowNote] = useState(false); // State để kiểm soát hiển thị khung ghi chú

  // 1. Khởi tạo Form Instance
  const [form] = Form.useForm();

  // 2. Logic Quản lý Dữ liệu Địa chỉ
  const [provinceData, setProvinceData] = useState<ProvinceData>({});
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    undefined
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    undefined
  );

  // Tính toán dữ liệu cho Select
  const cities = useMemo(() => Object.keys(provinceData), [provinceData]);
  const districts = useMemo(
    () => (selectedCity ? Object.keys(provinceData[selectedCity] || {}) : []),
    [provinceData, selectedCity]
  );
  const wards = useMemo(
    () =>
      selectedCity && selectedDistrict
        ? provinceData[selectedCity]?.[selectedDistrict] || []
        : [],
    [provinceData, selectedCity, selectedDistrict]
  );

  // Hàm xử lý khi chọn Tỉnh/Thành phố
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedDistrict(undefined);
    form.setFieldsValue({
      district: undefined,
      ward: undefined,
    });
  };

  // Hàm xử lý khi chọn Quận/Huyện
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ ward: undefined });
  };

  // 3. Tải Dữ liệu Tỉnh/Thành phố
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        // GIẢ ĐỊNH: Các hàm này có sẵn
        const provinces = await fetchProvincesV1(3);
        const transformed = transformV1Data(provinces);
        setProvinceData(transformed);
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  // Tải addresses và đặt giá trị mặc định cho form
  useEffect(() => {
    if (authUser?.userId) {
      loadAddresses();
    }
  }, [authUser]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddressesByCustomer(
        authUser!.userId
      );
      const sortedData = data.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      setAddresses(sortedData);

      const defaultAddress = sortedData.find((a) => a.isDefault);

      // Đặt giá trị mặc định cho Form từ địa chỉ mặc định
      if (defaultAddress) {
        form.setFieldsValue({
          receiverName: authUser?.fullName,
          receiverPhone: authUser?.phone,
          country: "Việt Nam",
          province: defaultAddress.province,
          district: defaultAddress.district,
          ward: defaultAddress.ward,
          specifics: defaultAddress.specifics,
        });
        setSelectedCity(defaultAddress.province);
        setSelectedDistrict(defaultAddress.district);
      } else {
        form.setFieldsValue({
          country: "Việt Nam",
          receiverName: authUser?.fullName,
          receiverPhone: authUser?.phone,
        });
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setLoading(false);
    }
  };

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
    form
      .validateFields()
      .then((values) => {
        console.log("Dữ liệu thanh toán:", values);
        navigate("/order-success");
      })
      .catch((info) => {
        console.log("Xác thực thất bại:", info);
      });
  };

  // --- STYLE CHUNG ĐƯỢC ÁP DỤNG ---
  const inputStyle: React.CSSProperties = {
    borderRadius: 8,
    height: 40,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
  };
  // --- KẾT THÚC STYLE CHUNG ---

  return (
    <div
      className="container"
      style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}
    >
      {/* Thẻ chú ý */}
      <Card
        style={{
          margin: 24,
          backgroundColor: "#fff0f6", // Màu hồng nhạt
          borderColor: "#ffadd2", // Border màu hồng đậm hơn
          borderRadius: 12,
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Text style={{ color: "#eb2f96" }}>
          <strong>Quý khách</strong> vui lòng sử dụng địa chỉ giao hàng trước{" "}
          <strong>01/07/2025</strong> để đặt hàng. Fahasa.com sẽ thông báo cập
          nhật địa chỉ mới ngay khi hoàn tất hệ thống.
        </Text>
      </Card>

      {/* Địa chỉ giao hàng */}
      <Spin
        spinning={loadingProvinces || loading}
        tip="Đang tải dữ liệu địa chỉ..."
      >
        <Card
          title="ĐỊA CHỈ GIAO HÀNG"
          style={{
            margin: 24,
            borderRadius: 12,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
          headStyle={{ borderBottom: "1px solid #f0f0f0" }}
        >
          <Form layout="vertical" form={form}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Họ và tên người nhận"
                  name="receiverName"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập họ và tên người nhận"
                    style={inputStyle}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="receiverPhone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" style={inputStyle} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Quốc gia" name="country">
                  <Select
                    options={[{ value: "Việt Nam", label: "Việt Nam" }]}
                    disabled
                    style={selectStyle}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Tỉnh/Thành phố"
                  name="province"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn Tỉnh/Thành phố!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn tỉnh/thành phố"
                    onChange={handleCityChange}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    disabled={loadingProvinces}
                    style={selectStyle}
                  >
                    {cities.map((city) => (
                      <Option key={city} value={city} label={city}>
                        {city}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Quận/Huyện"
                  name="district"
                  rules={[
                    { required: true, message: "Vui lòng chọn Quận/Huyện!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn quận/huyện"
                    onChange={handleDistrictChange}
                    disabled={!selectedCity || loadingProvinces}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={selectStyle}
                  >
                    {districts.map((district) => (
                      <Option key={district} value={district} label={district}>
                        {district}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Phường/Xã"
                  name="ward"
                  rules={[
                    { required: true, message: "Vui lòng chọn Phường/Xã!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn phường/xã"
                    disabled={!selectedDistrict || loadingProvinces}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={selectStyle}
                  >
                    {wards.map((ward) => (
                      <Option key={ward} value={ward} label={ward}>
                        {ward}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Địa chỉ chi tiết (Số nhà, tên đường...)"
              name="specifics"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ chi tiết!" },
              ]}
            >
              <Input placeholder="Nhập địa chỉ chi tiết" style={inputStyle} />
            </Form.Item>
          </Form>
        </Card>
      </Spin>

      {/* PHƯƠNG THỨC THANH TOÁN */}
      <Card
        title="PHƯƠNG THỨC THANH TOÁN"
        style={{
          margin: 24,
          borderRadius: 12,
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        }}
        headStyle={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <Radio.Group defaultValue="cod" style={{ width: "100%" }}>
          <Row gutter={[0, 12]}>
            <Col span={24}>
              <Radio value="vnpay">
                <img
                  src={vnpayIcon}
                  alt="VNPAY"
                  width={28}
                  style={{
                    marginRight: 8,
                    verticalAlign: "middle",
                    borderRadius: 4,
                  }}
                />
                <Text strong>VNPAY</Text>
              </Radio>
            </Col>

            <Col span={24}>
              <Radio value="momo">
                <img
                  src={momoIcon}
                  alt="MoMo"
                  width={28}
                  style={{
                    marginRight: 8,
                    verticalAlign: "middle",
                    borderRadius: 4,
                  }}
                />
                <Text strong>Ví MoMo</Text>
              </Radio>
            </Col>
            {/* Giả định thêm ZaloPay */}
            {/* <Col span={24}>
              <Radio value="zalopay">
                <img
                  src={zalopayIcon}
                  alt="ZaloPay"
                  width={28}
                  style={{ marginRight: 8, verticalAlign: "middle", borderRadius: 4 }}
                />
                <Text strong>Ví ZaloPay</Text>
              </Radio>
            </Col> */}

            <Col span={24}>
              <Radio value="cod">
                <Text strong>Thanh toán khi nhận hàng (COD)</Text>
              </Radio>
            </Col>
          </Row>
        </Radio.Group>
      </Card>

      {/* KHUNG GHI CHÚ ĐƠN HÀNG */}
      <Card
        title="THÔNG TIN KHÁC"
        style={{
          margin: 24,
          borderRadius: 12,
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        }}
        headStyle={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <Row align="middle" style={{ marginBottom: 12 }}>
          <Checkbox
            checked={showNote}
            onChange={(e) => setShowNote(e.target.checked)}
          >
            <Text strong>Ghi chú cho đơn hàng</Text>
          </Checkbox>
          <Button
            type="link"
            size="small"
            onClick={() => setShowNote(!showNote)}
            style={{ marginLeft: 8 }}
          >
            <EditOutlined /> {showNote ? "Thu gọn" : "Thêm ghi chú"}
          </Button>
        </Row>

        {showNote && (
          <Form.Item
            name="orderNote"
            style={{ marginTop: 8, marginBottom: 16 }}
          >
            <TextArea
              rows={3}
              placeholder="Ví dụ: Vui lòng gọi điện trước khi giao hàng hoặc chỉ giao trong giờ hành chính..."
              style={{ borderRadius: 8, border: "1px solid #ccc" }}
            />
          </Form.Item>
        )}

        <Divider style={{ margin: "8px 0 16px 0" }} />

        <Checkbox>
          <Text strong>Xuất hóa đơn GTGT</Text>{" "}
          <Button type="link" style={{ padding: 0 }}>
            Chi tiết
          </Button>
        </Checkbox>
        <Text
          type="danger"
          style={{ display: "block", marginTop: 8, fontSize: "0.85em" }}
        >
          *Từ ngày 01/11/2020, Công ty Fahasa không giải quyết việc xuất lại hóa
          đơn cho các trường hợp Quý khách không đăng ký thông tin.
        </Text>
      </Card>

      {/* MÃ KHUYẾN MÃI / GIFT CARD */}
      <Card
        title="MÃ KHUYẾN MÃI / GIFT CARD"
        style={{
          margin: 24,
          borderRadius: 12,
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        }}
        headStyle={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <Row gutter={8} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Nhập mã khuyến mãi / Gift Card"
              style={inputStyle}
            />
          </Col>
          <Col>
            <Button
              style={{
                backgroundColor: "#CB3131",
                color: "white",
                border: "none",
                fontWeight: "bold",
                borderRadius: 8,
                height: 40,
              }}
            >
              Áp dụng
            </Button>
          </Col>
          <Col>
            <Button type="link" style={{ color: "#CB3131", fontWeight: 600 }}>
              Chọn mã khuyến mãi
            </Button>
          </Col>
        </Row>
        <Text
          type="secondary"
          style={{ display: "block", marginTop: 8, fontSize: "0.9em" }}
        >
          Hướng dẫn sử dụng Gift Card <InfoCircleOutlined />
        </Text>
      </Card>

      {/* KIỂM TRA LẠI ĐƠN HÀNG */}
      <Card
        title="KIỂM TRA LẠI ĐƠN HÀNG"
        style={{
          margin: 24,
          borderRadius: 12,
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        }}
        headStyle={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <List
          dataSource={cartItems}
          renderItem={(item) => (
            <List.Item style={{ padding: "12px 0" }}>
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <img
                  src={item.imageUrl || "/default-book.png"}
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
                  <Text type="secondary" style={{ fontSize: "0.9em" }}>
                    Tác giả: {item.author}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "0.9em" }}>
                    Số lượng: {item.quantity}
                  </Text>
                </div>
                <Text strong style={{ color: "#d32f2f" }}>
                  {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                </Text>
              </div>
            </List.Item>
          )}
        />

        <Divider style={{ margin: "12px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text type="secondary">Thành tiền</Text>
          <Text type="secondary">{subtotal.toLocaleString("vi-VN")} ₫</Text>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text type="secondary">Phí vận chuyển</Text>
          <Text type="secondary">{shipping.toLocaleString("vi-VN")} ₫</Text>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={4} style={{ margin: 0, fontSize: "1.1em" }}>
            Tổng số tiền
          </Title>
          <Title
            level={4}
            type="danger"
            style={{ margin: 0, fontSize: "1.2em" }}
          >
            {total.toLocaleString("vi-VN")} ₫
          </Title>
        </div>
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "right", fontSize: "0.8em" }}
        >
          (Đã bao gồm VAT)
        </Text>
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
          justifyContent: "space-evenly",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div style={{ paddingLeft: "24px" }}>
          {" "}
          {/* Thêm padding để cân đối */}
          <div
            style={{
              display: "flex",
              gap: 12, // Dùng gap thay vì space-between với width cố định
              alignItems: "baseline",
            }}
          >
            <Text strong style={{ fontSize: "1.1em" }}>
              Tổng cộng:
            </Text>
            <Text strong style={{ color: "#d32f2f", fontSize: "1.2em" }}>
              {total.toLocaleString("vi-VN")} ₫
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: "0.9em" }}>
            (Đã bao gồm VAT)
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          onClick={handleCheckout}
          style={{
            background: "linear-gradient(180deg,#d83b3b,#b72222)",
            border: "none",
            fontWeight: 700,
            padding: "0 32px",
            height: 48,
            borderRadius: 8, // Góc bo tròn hơn
            boxShadow: "0 4px 15px rgba(216, 59, 59, 0.4)",
            transition: "all 0.3s ease",
            minWidth: 240, // Đảm bảo nút đủ lớn
          }}
        >
          XÁC NHẬN THANH TOÁN
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
