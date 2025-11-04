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
  message,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { type CartItemType } from "../components/CartItem";
import momoIcon from "../components/icons/logo-momo.png";
import vnpayIcon from "../components/icons/logo-vnpay.jpg";
import { addressService } from "../services/addressService";
import type { Address } from "../types/Address";
import { fetchProvincesV1, transformV1Data } from "../services/provincesApi";
import { orderService } from "../services/orderService";
import { useAppSelector } from "../store/hooks";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type ProvinceData = Record<string, Record<string, string[]>>;

const CheckoutPage: React.FC = () => {
  const authUser = useAppSelector((s) => s.auth.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [showNote, setShowNote] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [discountCode, setDiscountCode] = useState<string>("");

  const [form] = Form.useForm();
  // Province data
  const [provinceData, setProvinceData] = useState<ProvinceData>({});
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<
    string | undefined
  >();

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

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedDistrict(undefined);
    form.setFieldsValue({ district: undefined, ward: undefined });
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ ward: undefined });
  };

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const provinces = await fetchProvincesV1(3);
        const transformed = transformV1Data(provinces);
        setProvinceData(transformed);
      } catch (error) {
        console.error(error);
        message.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  // Load addresses
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
      const sortedData = data.sort((a, b) =>
        a.isDefault ? -1 : b.isDefault ? 1 : 0
      );
      setAddresses(sortedData);

      const defaultAddress = sortedData.find((a) => a.isDefault);
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
      message.error("Lỗi tải địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Load cart items
  useEffect(() => {
    if (location.state?.items) {
      setCartItems(location.state.items);
    } else {
      message.warning("Giỏ hàng trống!");
      navigate("/cart");
    }
  }, [location.state, navigate]);

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 20000;
  const total = subtotal + shipping;

  const handleCreateOrder = async (orderPayload: any) => {
    try {
      const data = await orderService.createOrder(orderPayload);
      return data;
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Xử lý thanh toán
  const handleCheckout = async () => {
    if (!authUser) {
      message.error("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Payload gửi backend
      const orderDetails = cartItems.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      }));

      const payload = {
        customerId: authUser.userId,
        discountCode: discountCode.trim() || null,
        orderDetails,
      };

      // Gọi API tạo đơn
      const orderData = await handleCreateOrder(payload);
      console.log("Order created:", orderData);
      // Lưu địa chỉ nếu cần
      const currentAddress = {
        main: 1,
        province: values.province,
        district: values.district,
        ward: values.ward,
        specifics: values.specifics,
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        isDefault: addresses.length === 0,
      };

      const defaultAddr = addresses.find((a) => a.isDefault);
      const isNewAddress =
        !defaultAddr ||
        defaultAddr.province !== values.province ||
        defaultAddr.specifics !== values.specifics;

      if (isNewAddress) {
        await addressService.createAddress(authUser.userId, currentAddress);
      }

      // Thành công
      message.success("Đặt hàng thành công!");
      navigate("/order-success", {
        state: {
          order: orderData,
          paymentMethod,
          address: currentAddress,
        },
      });
    } catch (error: any) {
      message.error(error.message || "Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: 8,
    height: 40,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  const selectStyle: React.CSSProperties = { ...inputStyle };

  return (
    <div
      className="container"
      style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 120 }}
    >
      <Spin
        spinning={loadingProvinces || loading || submitting}
        tip="Đang xử lý..."
      >
        {/* Thẻ chú ý */}
        <Card
          style={{
            margin: 24,
            backgroundColor: "#fff0f6",
            borderColor: "#ffadd2",
            borderRadius: 12,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Text style={{ color: "#eb2f96" }}>
            <strong>Quý khách</strong> vui lòng kiểm tra kỹ thông tin trước khi
            đặt hàng.
          </Text>
        </Card>

        {/* Địa chỉ giao hàng */}
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
                  <Input placeholder="Nhập họ và tên" style={inputStyle} />
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
                    disabled={!selectedCity}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={selectStyle}
                  >
                    {districts.map((d) => (
                      <Option key={d} value={d} label={d}>
                        {d}
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
                    disabled={!selectedDistrict}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={selectStyle}
                  >
                    {wards.map((w) => (
                      <Option key={w} value={w} label={w}>
                        {w}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Địa chỉ chi tiết"
              name="specifics"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ chi tiết!" },
              ]}
            >
              <Input placeholder="Số nhà, tên đường..." style={inputStyle} />
            </Form.Item>
          </Form>
        </Card>

        {/* Phương thức thanh toán */}
        <Card
          title="PHƯƠNG THỨC THANH TOÁN"
          style={{
            margin: 24,
            borderRadius: 12,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Radio.Group
            onChange={(e) => setPaymentMethod(e.target.value)}
            value={paymentMethod}
            style={{ width: "100%" }}
          >
            <Row gutter={[0, 12]}>
              <Col span={24}>
                <Radio value="ONLINE">
                  <img
                    src={vnpayIcon}
                    alt="VNPAY"
                    width={28}
                    style={{ marginRight: 8 }}
                  />
                  <Text strong>VNPAY</Text>
                </Radio>
              </Col>
              <Col span={24}>
                <Radio value="ONLINE">
                  <img
                    src={momoIcon}
                    alt="MoMo"
                    width={28}
                    style={{ marginRight: 8 }}
                  />
                  <Text strong>Ví MoMo</Text>
                </Radio>
              </Col>
              <Col span={24}>
                <Radio value="COD">
                  <Text strong>Thanh toán khi nhận hàng (COD)</Text>
                </Radio>
              </Col>
            </Row>
          </Radio.Group>
        </Card>

        {/* Ghi chú */}
        <Card
          title="THÔNG TIN KHÁC"
          style={{
            margin: 24,
            borderRadius: 12,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
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
            >
              <EditOutlined /> {showNote ? "Thu gọn" : "Thêm ghi chú"}
            </Button>
          </Row>
          {showNote && (
            <Form.Item name="orderNote">
              <TextArea
                rows={3}
                placeholder="Ghi chú..."
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          )}
        </Card>

        {/* Mã khuyến mãi */}
        <Card
          title="MÃ KHUYẾN MÃI"
          style={{
            margin: 24,
            borderRadius: 12,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Row gutter={8} align="middle">
            <Col flex="auto">
              <Input
                placeholder="Nhập mã khuyến mãi"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
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
                onClick={() => message.info("Chức năng đang phát triển")}
              >
                Áp dụng
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Kiểm tra đơn hàng */}
        <Card
          title="KIỂM TRA LẠI ĐƠN HÀNG"
          style={{
            margin: 24,
            borderRadius: 12,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <List
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item style={{ padding: "12px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    width={60}
                    height={60}
                    style={{
                      borderRadius: 6,
                      objectFit: "cover",
                      marginRight: 12,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>{item.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "0.9em" }}>
                      x{item.quantity}
                    </Text>
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
            <Text>Tổng tiền hàng</Text>
            <Text>{subtotal.toLocaleString("vi-VN")} ₫</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>Phí vận chuyển</Text>
            <Text>{shipping.toLocaleString("vi-VN")} ₫</Text>
          </div>
          <Divider />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Title level={4} style={{ margin: 0 }}>
              Tổng thanh toán
            </Title>
            <Title level={4} type="danger" style={{ margin: 0 }}>
              {total.toLocaleString("vi-VN")} ₫
            </Title>
          </div>
        </Card>

        {/* Nút cố định */}
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
          <div>
            <Text strong style={{ fontSize: "1.1em" }}>
              Tổng cộng:
            </Text>
            <Text
              strong
              style={{ color: "#d32f2f", fontSize: "1.3em", marginLeft: 8 }}
            >
              {total.toLocaleString("vi-VN")} ₫
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleCheckout}
            loading={submitting}
            style={{
              background: "linear-gradient(180deg,#d83b3b,#b72222)",
              border: "none",
              fontWeight: 700,
              padding: "0 40px",
              height: 50,
              borderRadius: 8,
              minWidth: 260,
            }}
          >
            {submitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
          </Button>
        </div>
      </Spin>
    </div>
  );
};

export default CheckoutPage;
