import { CopyOutlined, GiftOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  message,
  Row,
  Tabs,
  Spin,
} from "antd";
import { useState, useEffect } from "react";
import { fetchWalletVouchers } from "../../services/loyaltyService";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAllOrders } from "../../features/orders/ordersSlice";
import type { WalletVoucher } from "../../types/Loyalty";

const VoucherPage = () => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState("available");
  const [walletVouchers, setWalletVouchers] = useState<WalletVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders để lấy discount codes đã dùng
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      console.log("📥 Fetching orders for voucher usage tracking...");
      dispatch(getAllOrders({ page: 1, limit: 100 }));
    }
  }, [dispatch]);

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token") || "";

        if (!token) {
          throw new Error("No token found");
        }

        // Fetch all vouchers từ wallet (available, used, expired)
        let allVouchers = await fetchWalletVouchers(token);
        console.log("📱 Loaded wallet vouchers:", allVouchers);

        // ENHANCE: Thêm vouchers đã dùng từ order list nếu không có ở wallet
        // (Để hiển thị "Đã sử dụng" tab)
        const usedVouchersFromOrders = new Set<string>();
        console.log(
          "📦 Total orders loaded:",
          Array.isArray(orders) ? orders.length : 0
        );

        if (Array.isArray(orders)) {
          orders.forEach((order: any) => {
            console.log("🔍 Order:", {
              orderId: order.orderId,
              status: order.status,
              discountCode: order.discountCode,
            });

            if (order.discountCode?.discountCodeId) {
              usedVouchersFromOrders.add(order.discountCode.discountCodeId);
              console.log(
                `✅ Mark as used from order: ${order.discountCode.discountCodeId}`
              );
            }
          });
        }

        console.log(
          "🎁 Used vouchers from orders:",
          Array.from(usedVouchersFromOrders)
        );

        // Merge: Nếu voucher đã được dùng, set used: true
        allVouchers = allVouchers.map((v) => ({
          ...v,
          used: v.used || usedVouchersFromOrders.has(v.discountCodeId),
        }));

        console.log("💾 Final vouchers with status:", allVouchers);
        setWalletVouchers(allVouchers);
      } catch (error) {
        console.error("Error loading vouchers:", error);
        if (!(error instanceof Error && error.message === "No token found")) {
          message.error("Không thể tải danh sách voucher");
        }
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, [orders]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success("Đã copy mã voucher!");
  };

  const getVouchersByStatus = (status: "AVAILABLE" | "USED" | "EXPIRED") => {
    return walletVouchers.filter((v) => {
      // Check if voucher is expired
      const isExpired = new Date(v.expiryDate) < new Date();

      if (status === "EXPIRED") return isExpired;
      if (status === "USED") return v.used && !isExpired;
      if (status === "AVAILABLE") return !v.used && !isExpired;
      return false;
    });
  };

  const renderVoucherCard = (voucher: WalletVoucher) => {
    const isExpired = new Date(voucher.expiryDate) < new Date();
    const isUsed = voucher.used;
    const discount = `${voucher.percent}%`;
    const minOrder = voucher.minPriceToApply
      ? `Đơn hàng từ ${voucher.minPriceToApply.toLocaleString()}đ`
      : undefined;
    const expiryDate = new Date(voucher.expiryDate).toLocaleDateString("vi-VN");

    return (
      <Col xs={24} sm={12} lg={8} key={voucher.walletVoucherId}>
        <Card
          hoverable={!isExpired && !isUsed}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid #f0f0f0",
            position: "relative",
            opacity: isExpired || isUsed ? 0.6 : 1,
          }}
          styles={{ body: { padding: 0 } }}
        >
          {/* Voucher Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #C92127 0%, #E63946 100%)",
              padding: "16px 20px",
              color: "white",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {discount}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>{minOrder}</div>
              </div>
              <GiftOutlined style={{ fontSize: 32, opacity: 0.3 }} />
            </div>
          </div>

          {/* Voucher Body */}
          <div style={{ padding: "16px 20px" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#333",
                marginBottom: 8,
              }}
            >
              {voucher.name}
            </div>

            {voucher.description && (
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 12,
                }}
              >
                {voucher.description}
              </div>
            )}

            {/* Voucher Code */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#FFF5F5",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#C92127",
                  fontSize: 14,
                }}
              >
                {voucher.discountCodeId}
              </span>
              <Button
                type="link"
                icon={<CopyOutlined />}
                size="small"
                onClick={() => handleCopyCode(voucher.discountCodeId)}
                style={{ color: "#C92127" }}
                disabled={isExpired || isUsed}
              >
                Copy
              </Button>
            </div>

            {/* Expiry Date */}
            <div
              style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
              }}
            >
              HSD: {expiryDate}
            </div>

            {/* Status Badge */}
            {(isExpired || isUsed) && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: isExpired ? "#ff4d4f" : "#52c41a",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {isExpired ? "Hết hạn" : "Đã dùng"}
              </div>
            )}
          </div>
        </Card>
      </Col>
    );
  };

  const tabItems = [
    {
      key: "available",
      label: (
        <span>
          Có thể sử dụng
          <Badge
            count={getVouchersByStatus("AVAILABLE").length}
            style={{
              marginLeft: 8,
              backgroundColor: "#C92127",
            }}
          />
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {getVouchersByStatus("AVAILABLE").length > 0 ? (
            getVouchersByStatus("AVAILABLE").map(renderVoucherCard)
          ) : (
            <Col span={24}>
              <Empty
                description="Không có voucher khả dụng"
                style={{ padding: "40px 0" }}
              />
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: "used",
      label: "Đã sử dụng",
      children: (
        <Row gutter={[16, 16]}>
          {getVouchersByStatus("USED").length > 0 ? (
            getVouchersByStatus("USED").map(renderVoucherCard)
          ) : (
            <Col span={24}>
              <Empty
                description="Chưa có voucher đã sử dụng"
                style={{ padding: "40px 0" }}
              />
            </Col>
          )}
        </Row>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          <GiftOutlined style={{ marginRight: 8, color: "#C92127" }} />
          Ví Voucher
        </div>
      }
      variant="borderless"
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <Spin />
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginTop: -8 }}
        />
      )}
    </Card>
  );
};

export default VoucherPage;
