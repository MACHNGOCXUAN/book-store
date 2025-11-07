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
  Modal,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Checkbox } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { type CartItemType } from "../components/CartItem";
import momoIcon from "../components/icons/logo-momo.png";
import vnpayIcon from "../components/icons/logo-vnpay.jpg";
import type { Address } from "../types/Address";
import { fetchProvincesV1, transformV1Data } from "../services/provincesApi";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { createOrder, clearOrder } from "../features/orders/ordersSlice";
import { fetchCart } from "../features/cart/cartSlice";
import {
  getAddresses,
  createAddress as createAddressAction,
} from "../features/addresses/addressSlice";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type ProvinceData = Record<string, Record<string, string[]>>;

const CheckoutPage: React.FC = () => {
  const authUser = useAppSelector((s) => s.auth.user);
  const addressState = useAppSelector((s) => s.addresses);
  const dispatch = useAppDispatch();
  const { loading: orderLoading, error: orderError } = useAppSelector(
    (s) => s.orders
  );
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [showNote, setShowNote] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY" | "MOMO">(
    "COD"
  );
  const [discountCode, setDiscountCode] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentOrderPayment, setCurrentOrderPayment] = useState<any>(null);

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

  // Load addresses using Redux
  useEffect(() => {
    if (authUser?.userId) {
      dispatch(getAddresses(authUser.userId)).then(() => {
        setLoading(false);
      });
    }
  }, [authUser, dispatch]);

  // Populate form with default address
  useEffect(() => {
    if (addressState.addresses.length > 0 && !loading) {
      const defaultAddress = addressState.addresses.find((a) => a.isDefault);
      if (defaultAddress) {
        form.setFieldsValue({
          receiverName: defaultAddress.receiverName,
          receiverPhone: defaultAddress.receiverPhone,
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
    } else if (addressState.addresses.length === 0 && !loading) {
      form.setFieldsValue({
        country: "Việt Nam",
        receiverName: authUser?.fullName,
        receiverPhone: authUser?.phone,
      });
    }
  }, [addressState.addresses, loading, authUser, form]);

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

  // Xử lý thanh toán
  const handleCheckout = async () => {
    console.log("🔵 handleCheckout called");

    if (!authUser) {
      console.log("❌ No auth user");
      message.error("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    try {
      console.log("📋 Validating form...");
      const values = await form.validateFields();
      console.log("✅ Form validated:", values);

      // Kiểm tra giỏ hàng
      if (!cartItems || cartItems.length === 0) {
        console.log("❌ Cart is empty");
        message.error("Giỏ hàng trống!");
        return;
      }

      console.log("📦 Cart items:", cartItems);

      // Tạo payload đúng định dạng Backend yêu cầu
      const orderDetails = cartItems.map((item) => ({
        bookId: String(item.bookId || ""),
        quantity: item.quantity,
      }));

      const orderPayload = {
        customerId: authUser.userId,
        discountCode: discountCode.trim() || null,
        orderDetails,
      };

      console.log("📤 Dispatching createOrder with payload:", orderPayload);

      // Dispatch Redux action để tạo đơn
      const result = await dispatch(createOrder(orderPayload));

      console.log("📥 Order result:", result);

      // Kiểm tra kết quả
      if (result.meta.requestStatus === "fulfilled") {
        console.log("✅ Order created successfully!");

        toast.success("Đặt hàng thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Lưu địa chỉ nếu là mới
        const currentAddress = {
          main: 1,
          province: values.province,
          district: values.district,
          ward: values.ward,
          specifics: values.specifics,
          receiverName: values.receiverName,
          receiverPhone: values.receiverPhone,
          isDefault: addressState.addresses.length === 0,
        };

        const defaultAddr = addressState.addresses.find((a) => a.isDefault);
        const isNewAddress =
          !defaultAddr ||
          defaultAddr.province !== values.province ||
          defaultAddr.specifics !== values.specifics;

        if (isNewAddress) {
          console.log("💾 Saving new address...");
          dispatch(
            createAddressAction({
              customerId: authUser.userId,
              address: currentAddress as Address,
            })
          );
        }

        // Reload cart
        dispatch(fetchCart());

        // Nếu là thanh toán ONLINE và có QR code, hiển thị modal QR code
        if (
          (paymentMethod === "VNPAY" || paymentMethod === "MOMO") &&
          result.payload &&
          typeof result.payload === "object" &&
          result.payload.payment?.qrCodeBase64
        ) {
          console.log(
            "💳 Showing QR code for payment:",
            result.payload.payment
          );
          setCurrentOrderPayment({
            order: result.payload.order,
            payment: result.payload.payment,
            address: currentAddress,
          });
          setShowQRModal(true);
        } else if (result.payload && typeof result.payload === "object") {
          // Nếu là COD, chuyển hướng ngay
          dispatch(clearOrder());
          navigate("/order-success", {
            state: {
              order: result.payload.order,
              paymentMethod,
              address: currentAddress,
            },
          });
        }
      } else {
        console.log("❌ Order creation failed:", result);
        // Extract error message from rejected action
        const errorMessage =
          result.payload ||
          orderError ||
          "Đặt hàng thất bại. Vui lòng thử lại!";

        console.error("📋 Error details:", errorMessage);

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error: any) {
      console.error("❌ Exception in handleCheckout:", error);
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
        spinning={loadingProvinces || loading || orderLoading}
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
                      ((option?.label as string) ?? "")
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
                      ((option?.label as string) ?? "")
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
                      ((option?.label as string) ?? "")
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
                <Radio value="VNPAY">
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
                <Radio value="MOMO">
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
            loading={orderLoading}
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
            {orderLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
          </Button>
        </div>

        {/* QR Code Modal */}
        <Modal
          title="Thanh toán qua VNPay"
          open={showQRModal}
          onCancel={() => setShowQRModal(false)}
          width={500}
          style={{ textAlign: "center" }}
          bodyStyle={{
            background: "linear-gradient(135deg, #fdfbfb 0%, #f4f4f9 100%)",
            padding: "32px 24px",
          }}
          footer={[
            <Button
              key="close"
              onClick={() => setShowQRModal(false)}
              style={{ borderRadius: 8 }}
            >
              Đóng
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={() => {
                dispatch(clearOrder());
                navigate("/order-success", {
                  state: {
                    order: currentOrderPayment?.order,
                    paymentMethod: paymentMethod,
                    address: currentOrderPayment?.address,
                    payment: currentOrderPayment?.payment,
                  },
                });
                setShowQRModal(false);
              }}
              style={{
                background: "#d32f2f",
                borderRadius: 8,
              }}
            >
              Xác nhận đã thanh toán
            </Button>,
          ]}
        >
          <div style={{ padding: "16px 0" }}>
            <Text
              strong
              style={{ fontSize: 18, display: "block", marginBottom: 20 }}
            >
              Mã QR thanh toán
            </Text>
            {currentOrderPayment?.payment?.qrCodeBase64 && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: 16,
                      borderRadius: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={currentOrderPayment.payment.qrCodeBase64}
                      alt="QR Code"
                      style={{
                        maxWidth: 280,
                        width: "100%",
                        height: "auto",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Hạn thanh toán:{" "}
                    {currentOrderPayment.payment.expiresAt
                      ? new Date(
                          currentOrderPayment.payment.expiresAt
                        ).toLocaleString("vi-VN")
                      : "15 phút từ bây giờ"}
                  </Text>
                </div>
                <div
                  style={{
                    marginBottom: 16,
                    padding: "16px",
                    background: "white",
                    borderRadius: 8,
                    border: "2px solid #d32f2f",
                    boxShadow: "0 2px 8px rgba(211, 47, 47, 0.15)",
                  }}
                >
                  <Text strong style={{ color: "#d32f2f", fontSize: 18 }}>
                    {currentOrderPayment.payment.amount?.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    ₫
                  </Text>
                </div>
              </>
            )}
            <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
              Quét mã QR bằng ứng dụng ngân hàng hoặc ứng dụng hỗ trợ thanh toán
            </Text>
          </div>
        </Modal>
      </Spin>
    </div>
  );
};

export default CheckoutPage;
