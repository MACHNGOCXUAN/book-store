import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  List,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Typography,
} from "antd";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type CartItemType } from "../components/CartItem";
import VoucherSelector from "../components/VoucherSelector";
import momoIcon from "../components/icons/logo-momo.png";
import vnpayIcon from "../components/icons/logo-vnpay.jpg";
import {
  createAddress as createAddressAction,
  getAddresses,
} from "../features/addresses/addressSlice";
import { fetchCart } from "../features/cart/cartSlice";
import { clearOrder, createOrder } from "../features/orders/ordersSlice";
import { createMoMoPaymentOnly } from "../services/momoApi";
import { fetchProvincesV1, transformV1Data } from "../services/provincesApi";
import { createVNPayPaymentOnly } from "../services/vnpayApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Address } from "../types/Address";

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
  const [isApplyingDiscountCode, setIsApplyingDiscountCode] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<
    string | undefined
  >();
  const [discountAmount, setDiscountAmount] = useState<number>(0);
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
  const total = subtotal + shipping - discountAmount;

  // Xử lý áp dụng mã giảm giá text input
  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      message.warning("Vui lòng nhập mã giảm giá!");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      message.error("Vui lòng đăng nhập!");
      return;
    }

    setIsApplyingDiscountCode(true);
    try {
      // Get API URL from config
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8080/api";

      const response = await fetch(
        `${API_URL}/discounts/apply-code?code=${encodeURIComponent(
          discountCode.trim()
        )}&cartTotal=${subtotal}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          errorData.message ||
          `Lỗi ${response.status}: Không thể áp dụng mã giảm giá`
        );
      }

      const data = await response.json();
      setDiscountAmount(data.discountAmount || 0);
      message.success(
        `Áp dụng mã giảm giá thành công! Tiết kiệm ${(
          data.discountAmount || 0
        ).toLocaleString("vi-VN")}₫`
      );
      setDiscountCode(""); // Clear input sau khi áp dụng
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsApplyingDiscountCode(false);
    }
  };

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
      let values;
      try {
        values = await form.validateFields();
      } catch (validationError: any) {
        console.log("❌ Form validation failed:", validationError?.errorFields);
        // Form validation errors are already shown by Ant Design
        return;
      }
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

      // Gửi cả voucherId và discountCode nếu có
      const orderPayload = {
        customerId: authUser.userId,
        voucherId: selectedVoucherId || null,
        discountCode: null, // Discount code đã được áp dụng trước, không cần gửi lại
        orderDetails,
      };

      console.log("📤 Dispatching createOrder with payload:", orderPayload);

      // Kiểm tra xem có phải thanh toán MoMo không
      if (paymentMethod === "MOMO") {
        console.log("💳 Processing MoMo payment...");

        // Validate MoMo amount constraints
        if (total < 1000) {
          message.error("Số tiền tối thiểu cho thanh toán MoMo là 1,000 VND. Vui lòng chọn phương thức thanh toán khác hoặc thêm sản phẩm vào giỏ hàng.");
          return;
        }

        if (total > 50000000) {
          message.error("Số tiền tối đa cho thanh toán MoMo là 50,000,000 VND. Vui lòng chọn phương thức thanh toán khác.");
          return;
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
          message.error("Vui lòng đăng nhập!");
          navigate("/login");
          return;
        }

        try {
          // Gọi API tạo MoMo payment (KHÔNG tạo order)
          const momoResponse = await createMoMoPaymentOnly(orderPayload, token);
          console.log("✅ MoMo payment created (no order yet):", momoResponse);
          console.log("   Payment data:", momoResponse.payment);
          console.log("   QR Code URL:", momoResponse.payment?.qrCodeUrl);

          toast.success("Vui lòng quét mã QR để thanh toán.", {
            position: "top-right",
            autoClose: 2000,
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

          // KHÔNG reload cart vì chưa tạo order
          // dispatch(fetchCart());

          // Hiển thị modal QR MoMo - lưu cả orderPayload và address để dùng sau
          setCurrentOrderPayment({
            orderPayload: momoResponse.orderRequest, // Lưu để tạo order sau
            payment: momoResponse.payment,
            address: currentAddress,
            values: values, // Lưu form values
          });
          setShowQRModal(true);

          return; // Dừng lại để không chạy logic bên dưới
        } catch (error) {
          console.error("❌ MoMo checkout error:", error);

          // Lấy thông báo lỗi chi tiết
          let errorMessage = "Không thể tạo thanh toán MoMo. Vui lòng thử lại!";

          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            const err = error as any;
            if (err.response?.data?.message) {
              errorMessage = err.response.data.message;
            } else if (err.message) {
              errorMessage = err.message;
            }
          }

          console.error("📋 Error message:", errorMessage);

          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }
      }

      // Kiểm tra xem có phải thanh toán VNPay không
      if (paymentMethod === "VNPAY") {
        console.log("💳 Processing VNPay payment...");

        // Validate VNPay amount constraints
        if (total < 1000) {
          message.error("Số tiền tối thiểu cho thanh toán VNPay là 1,000 VND. Vui lòng chọn phương thức thanh toán khác hoặc thêm sản phẩm vào giỏ hàng.");
          return;
        }

        if (total > 50000000) {
          message.error("Số tiền tối đa cho thanh toán VNPay là 50,000,000 VND. Vui lòng chọn phương thức thanh toán khác.");
          return;
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
          message.error("Vui lòng đăng nhập!");
          navigate("/login");
          return;
        }

        try {
          // Gọi API tạo VNPay payment (KHÔNG tạo order)
          const vnpayResponse = await createVNPayPaymentOnly(
            {
              customerId: authUser!.userId,
              voucherId: selectedVoucherId || null,
              discountCode: discountCode || null,
              orderDetails: cartItems.map((item) => ({
                bookId: String(item.bookId),
                quantity: item.quantity,
              })),
            },
            token
          );

          console.log("✅ VNPay payment created (no order yet):", vnpayResponse);
          console.log("   Payment data:", vnpayResponse.payment);
          console.log("   QR Code Base64:", vnpayResponse.payment?.qrCodeBase64?.substring(0, 50) + "...");

          toast.success("Vui lòng quét mã QR để thanh toán VNPay.", {
            position: "top-right",
            autoClose: 2000,
          });

          // Tạo address object
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

          // Lưu orderPayload và payment data để tạo order sau khi xác nhận thanh toán
          setCurrentOrderPayment({
            orderPayload: vnpayResponse.orderRequest, // Lưu để tạo order sau
            payment: vnpayResponse.payment,
            address: currentAddress,
            values: values,
          });

          setShowQRModal(true);
          return; // Dừng lại để không chạy logic bên dưới
        } catch (error) {
          console.error("❌ VNPay checkout error:", error);

          let errorMessage = "Không thể tạo thanh toán VNPay. Vui lòng thử lại!";

          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            const err = error as any;
            if (err.response?.data?.message) {
              errorMessage = err.response.data.message;
            } else if (err.message) {
              errorMessage = err.message;
            }
          }

          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
      }

      // Dispatch Redux action để tạo đơn (CHỈ cho COD)
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

        // COD - chuyển hướng trực tiếp đến trang success
        if (result.payload && typeof result.payload === "object") {
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
          (typeof result.payload === "string" ? result.payload : null) ||
          orderError ||
          "Đặt hàng thất bại. Vui lòng thử lại!";

        console.error("📋 Error details:", errorMessage);

        toast.error(String(errorMessage), {
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
      const errorMsg =
        error?.message ||
        error?.toString?.() ||
        "Có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(errorMsg, {
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
          styles={{ header: { borderBottom: "1px solid #f0f0f0" } }}
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
                  {total < 1000 && (
                    <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
                      (Tối thiểu 1,000 VND)
                    </Text>
                  )}
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
          title="MÃ KHUYẾN MÃI / VOUCHER"
          style={{
            margin: 24,
            borderRadius: 12,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <VoucherSelector
              cartTotal={subtotal}
              selectedVoucherId={selectedVoucherId}
              onApplyVoucher={(voucherId, discount) => {
                setSelectedVoucherId(voucherId);
                setDiscountAmount(discount);
                message.success(
                  `Áp dụng voucher thành công! Tiết kiệm ${discount}₫`
                );
              }}
            />
          </div>

          <Divider />

          <div style={{ marginTop: 12 }}>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginBottom: 8 }}
            >
              Hoặc nhập mã khuyến mãi trực tiếp:
            </Text>
            <Row gutter={8} align="middle">
              <Col flex="auto">
                <Input
                  placeholder="Nhập mã khuyến mãi"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={isApplyingDiscountCode}
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
                  loading={isApplyingDiscountCode}
                  disabled={!discountCode.trim() || isApplyingDiscountCode}
                  onClick={handleApplyDiscountCode}
                >
                  Áp dụng
                </Button>
              </Col>
            </Row>
          </div>

          {discountAmount > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: "12px",
                background: "#F0F5FF",
                borderRadius: 6,
                border: "1px solid #91caff",
              }}
            >
              <Text style={{ color: "#1890ff" }}>
                ✓ Giảm giá:{" "}
                <strong>{discountAmount.toLocaleString("vi-VN")}₫</strong>
              </Text>
            </div>
          )}
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
          {discountAmount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#52c41a",
              }}
            >
              <Text style={{ color: "#52c41a" }}>
                <strong>Giảm giá</strong>
              </Text>
              <Text strong style={{ color: "#52c41a" }}>
                -{discountAmount.toLocaleString("vi-VN")} ₫
              </Text>
            </div>
          )}
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
          title={paymentMethod === "MOMO" ? "Thanh toán qua MoMo" : "Thanh toán qua VNPay"}
          open={showQRModal}
          onCancel={() => setShowQRModal(false)}
          width={500}
          style={{ textAlign: "center" }}
          styles={{
            body: {
              background: "linear-gradient(135deg, #fdfbfb 0%, #f4f4f9 100%)",
              padding: "32px 24px",
            },
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
              onClick={async () => {
                // Nếu là MoMo hoặc VNPay và chưa có order, tạo order bây giờ
                if ((paymentMethod === "MOMO" || paymentMethod === "VNPAY") && currentOrderPayment?.orderPayload) {
                  try {
                    console.log("🔄 Creating order after payment confirmation...");
                    const result = await dispatch(createOrder(currentOrderPayment.orderPayload));

                    if (result.meta.requestStatus === "fulfilled") {
                      toast.success("Đặt hàng thành công!", {
                        position: "top-right",
                        autoClose: 2000,
                      });

                      // Lưu địa chỉ nếu cần
                      const defaultAddr = addressState.addresses.find((a) => a.isDefault);
                      const isNewAddress =
                        !defaultAddr ||
                        defaultAddr.province !== currentOrderPayment.values.province ||
                        defaultAddr.specifics !== currentOrderPayment.values.specifics;

                      if (isNewAddress) {
                        dispatch(
                          createAddressAction({
                            customerId: authUser!.userId,
                            address: currentOrderPayment.address as Address,
                          })
                        );
                      }

                      // Reload cart
                      dispatch(fetchCart());

                      // Navigate to success page
                      dispatch(clearOrder());
                      navigate("/order-success", {
                        state: {
                          order: (result.payload as any)?.order,
                          paymentMethod: paymentMethod,
                          address: currentOrderPayment.address,
                          payment: currentOrderPayment.payment,
                        },
                      });
                      setShowQRModal(false);
                    } else {
                      toast.error("Không thể tạo đơn hàng. Vui lòng liên hệ hỗ trợ!", {
                        position: "top-right",
                        autoClose: 3000,
                      });
                    }
                  } catch (error) {
                    console.error("❌ Error creating order:", error);
                    toast.error("Có lỗi xảy ra khi tạo đơn hàng!", {
                      position: "top-right",
                      autoClose: 3000,
                    });
                  }
                } else {
                  // Trường hợp khác - navigate trực tiếp
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
                }
              }}
              style={{
                background: paymentMethod === "MOMO" ? "#d82d8b" : "#d32f2f",
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
            {/* Hiển thị QR cho cả MoMo và VNPay */}
            {paymentMethod === "MOMO" && currentOrderPayment?.payment?.qrCodeUrl ? (
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
                    {/* Generate QR từ chuỗi EMVCo data */}
                    <QRCodeSVG
                      value={currentOrderPayment.payment.qrCodeUrl}
                      size={280}
                      level="M"
                      includeMargin={true}
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
                    border: "2px solid #d82d8b",
                    boxShadow: "0 2px 8px rgba(216, 45, 139, 0.15)",
                  }}
                >
                  <Text strong style={{ color: "#d82d8b", fontSize: 18 }}>
                    {currentOrderPayment.payment.amount?.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    ₫
                  </Text>
                </div>
              </>
            ) : currentOrderPayment?.payment?.qrCodeBase64 ? (
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
                      alt="VNPay QR Code"
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
            ) : null}
            <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
              {paymentMethod === "MOMO"
                ? "Quét mã QR bằng ứng dụng MoMo để thanh toán"
                : "Quét mã QR bằng ứng dụng ngân hàng hoặc ứng dụng hỗ trợ thanh toán"}
            </Text>
          </div>
        </Modal>
      </Spin>
    </div>
  );
};

export default CheckoutPage;
