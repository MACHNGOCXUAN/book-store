import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Package,
  ShoppingCart,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import "../styles/payment.css";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { getOrderDetail } from "../features/orders/ordersSlice";

const PaymentSuccess = ({ orderId, orderData }) => {
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="payment-page-wrapper payment-page-success">
      <div className="payment-container">
        <div className="payment-header animate-fade-in">
          <div className="payment-icon-wrapper payment-icon-success animate-scale-in">
            <CheckCircle size={48} />
          </div>
          <h1>Đặt hàng thành công!</h1>
          <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
        </div>

        <div className="payment-card">
          <div className="payment-card-header">
            <div className="order-id-section">
              <span className="order-id-label">Mã đơn hàng</span>
              <div className="order-id-row">
                <span className="order-id-value">{orderId}</span>
                <button onClick={copyOrderId} className="copy-button">
                  {copied ? "✓ Đã sao chép" : "Sao chép"}
                </button>
              </div>
            </div>
            <div className="total-section">
              <span className="total-label">Tổng tiền</span>
              <div className="total-amount">
                {orderData.totalAmount.toLocaleString("vi-VN")}đ
              </div>
            </div>
          </div>

          <div className="order-details-wrapper">
            <div className="detail-row">
              <Clock size={20} className="detail-icon" />
              <span className="detail-label">Thời gian đặt:</span>
              <span className="detail-value">{orderData.orderTime}</span>
            </div>
            <div className="detail-row">
              <CreditCard size={20} className="detail-icon" />
              <span className="detail-label">Phương thức:</span>
              <span className="detail-value">{orderData.paymentMethod}</span>
            </div>
            <div className="detail-row">
              <MapPin size={20} className="detail-icon" />
              <div className="detail-flex">
                <span className="detail-label">Địa chỉ giao hàng:</span>
                <p className="address-value">{orderData.shippingAddress}</p>
              </div>
            </div>
          </div>

          <div className="timeline-wrapper">
            <p className="timeline-title">Trạng thái đơn hàng</p>
            <div className="timeline-container">
              <div className="timeline-item">
                <div className="timeline-node timeline-node-active">
                  <CheckCircle size={20} />
                </div>
                <p className="timeline-label timeline-label-active">
                  Đã đặt hàng
                </p>
                <p className="timeline-time">Vừa xong</p>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-item">
                <div className="timeline-node timeline-node-pending">
                  <Package size={20} />
                </div>
                <p className="timeline-label timeline-label-pending">
                  Đang xử lý
                </p>
                <p className="timeline-time">Chờ xác nhận</p>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-item">
                <div className="timeline-node timeline-node-pending">
                  <Package size={20} />
                </div>
                <p className="timeline-label timeline-label-pending">
                  Đang giao
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-card">
          <h2 className="items-title">Chi tiết đơn hàng</h2>
          <div className="items-list">
            {orderData.items.map((item, index) => (
              <div key={index} className="item-row">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-quantity">SL: {item.quantity}</p>
                </div>
                <p className="item-price">
                  {item.price.toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="info-box info-box-support">
          <div className="info-content">
            <AlertCircle size={20} className="info-icon-alert" />
            <div className="info-text">
              <p className="info-title">Thông tin hỗ trợ</p>
              <div className="contact-list">
                <div className="contact-item">
                  <Phone size={16} className="contact-icon" />
                  <span>Hotline: 1900-xxxx</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} className="contact-icon" />
                  <span>support@bookstore.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="button-group">
          <button
            onClick={() => (window.location.href = "/orders/" + orderId)}
            className="payment-button payment-button-primary"
          >
            <Package size={20} />
            <span>Kiểm tra đơn hàng</span>
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="payment-button payment-button-secondary"
          >
            <ShoppingCart size={20} />
            <span>Tiếp tục mua hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentFailed = ({ errorCode, errorMessage }) => {
  const getErrorDetails = (code) => {
    const errors = {
      "07": {
        title: "Giao dịch bị từ chối",
        desc: "Ngân hàng của bạn đã từ chối giao dịch này. Vui lòng kiểm tra lại thẻ hoặc liên hệ ngân hàng.",
      },
      "09": {
        title: "Thẻ chưa đăng ký dịch vụ",
        desc: "Thẻ của bạn chưa được đăng ký dịch vụ thanh toán online. Vui lòng liên hệ ngân hàng để kích hoạt.",
      },
      "24": {
        title: "Giao dịch bị hủy",
        desc: "Bạn đã hủy giao dịch thanh toán.",
      },
      COD: {
        title: "Đơn hàng đang chờ xác nhận",
        desc: "Đơn hàng của bạn đã được tạo thành công và đang chờ xác nhận từ cửa hàng. Bạn sẽ thanh toán khi nhận hàng.",
      },
      default: {
        title: "Thanh toán không thành công",
        desc:
          errorMessage ||
          "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
      },
    };
    return errors[code] || errors.default;
  };

  const errorDetails = getErrorDetails(errorCode);

  return (
    <div className="payment-page-wrapper payment-page-failed">
      <div className="payment-container payment-container-small">
        <div className="payment-header animate-fade-in">
          <div className="payment-icon-wrapper payment-icon-failed animate-shake">
            <XCircle size={48} />
          </div>
          <h1>Thanh toán thất bại</h1>
          <p>{errorDetails.title}</p>
        </div>

        <div className="payment-card">
          <div className="info-box-error">
            <div className="info-content">
              <AlertCircle size={20} className="error-icon-alert" />
              <div className="error-text">
                <p className="error-title">Chi tiết lỗi</p>
                <p className="error-description">{errorDetails.desc}</p>
                {errorCode && <p className="error-code">Mã lỗi: {errorCode}</p>}
              </div>
            </div>
          </div>

          <div className="issues-section">
            <p className="issues-title">Nguyên nhân thường gặp:</p>
            <ul className="issues-list">
              <li className="issue-item">
                <span className="issue-bullet">•</span>
                <span>Số dư tài khoản không đủ</span>
              </li>
              <li className="issue-item">
                <span className="issue-bullet">•</span>
                <span>Thông tin thẻ không chính xác</span>
              </li>
              <li className="issue-item">
                <span className="issue-bullet">•</span>
                <span>Thẻ đã hết hạn hoặc bị khóa</span>
              </li>
              <li className="issue-item">
                <span className="issue-bullet">•</span>
                <span>Vượt quá hạn mức giao dịch</span>
              </li>
              <li className="issue-item">
                <span className="issue-bullet">•</span>
                <span>Kết nối mạng không ổn định</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="info-box info-box-support">
          <div className="info-content">
            <div className="info-icon-wrapper">
              <Phone size={20} />
            </div>
            <div className="info-text">
              <p className="info-title">Cần hỗ trợ?</p>
              <p className="info-description">
                Đội ngũ chăm sóc khách hàng của chúng tôi sẵn sàng hỗ trợ bạn
                24/7
              </p>
              <div className="contact-list">
                <div className="contact-item">
                  <Phone size={16} className="contact-icon" />
                  <span>Hotline: 1900-xxxx</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} className="contact-icon" />
                  <span>support@bookstore.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="button-group">
          <button
            onClick={() => (window.location.href = "/cart")}
            className="payment-button payment-button-primary button-full"
          >
            <CreditCard size={20} />
            <span>Thử lại thanh toán</span>
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="payment-button payment-button-secondary button-full"
          >
            <ShoppingCart size={20} />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentStatus = () => {
  const dispatch = useAppDispatch();
  const { currentOrder } = useAppSelector((state) => state.orders);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Backend đã xử lý redirect với real orderId, không cần sessionId nữa
  const orderId = params.get("orderId"); // Real orderId từ backend handler
  const resultCode = params.get("resultCode");
  const status = params.get("status");

  // Load order details khi có orderId
  useEffect(() => {
    if (orderId && orderId !== "ERROR" && orderId !== "NOT_FOUND") {
      dispatch(getOrderDetail(orderId));
    }
    setLoading(false);
  }, [dispatch, orderId]);

  if (loading) {
    return <div>Loading</div>;
  }

  if (!orderId || orderId === "ERROR" || orderId === "NOT_FOUND") {
    return <div>Không có dữ liệu đơn hàng</div>;
  }

  const mockSuccessData = {
    totalAmount: currentOrder?.totalAmount,
    orderTime: currentOrder?.orderDate,
    paymentMethod: currentOrder?.payments[0].method,
    shippingAddress: currentOrder?.customer.address,
    items: currentOrder?.orderDetails.map((item) => {
      return {
        name: item.book.title,
        quantity: item.quantity,
        price: item.unitPrice,
        image: item.book.coverImage,
      };
    }),
  };

  if (!currentOrder) {
    return <div>Loading</div>;
  }

  // Determine success or failure
  // Success if: resultCode === "0" (MoMo/VNPay) OR no error params (COD)
  const isSuccess =
    resultCode === "0" || status === "success" || (!resultCode && !status);

  // Nếu COD (không có error code) nhưng không phải success → hiển thị payment info
  const isCOD = !resultCode && !status;

  return (
    <div>
      {isSuccess ? (
        <PaymentSuccess
          orderId={currentOrder?.orderId}
          orderData={mockSuccessData}
        />
      ) : (
        <PaymentFailed
          errorCode={isCOD ? "COD" : resultCode || "07"}
          errorMessage={params.get("message") || "Giao dịch bị từ chối"}
        />
      )}
    </div>
  );
};

export default PaymentStatus;
