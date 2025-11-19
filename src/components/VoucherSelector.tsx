import { useState, useEffect } from "react";
import { Card, Row, Col, Button, message, Spin, Empty, Drawer } from "antd";
import { GiftOutlined } from "@ant-design/icons";
import { fetchWalletVouchers } from "../services/loyaltyService";
import type { WalletVoucher } from "../types/Loyalty";

interface VoucherSelectorProps {
  cartTotal: number;
  onApplyVoucher: (voucherId: string, discountAmount: number) => void;
  selectedVoucherId?: string;
}

const VoucherSelector: React.FC<VoucherSelectorProps> = ({
  cartTotal,
  onApplyVoucher,
  selectedVoucherId,
}) => {
  const [vouchers, setVouchers] = useState<WalletVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<WalletVoucher | null>(
    null
  );
  const [isApplying, setIsApplying] = useState(false);

  const token = localStorage.getItem("access_token") || "";

  // Load available vouchers khi component mount hoặc cartTotal thay đổi
  useEffect(() => {
    if (cartTotal > 0 && token) {
      loadVouchers();
    }
  }, [cartTotal, token]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      // Fetch từ wallet vouchers (đã filter ONE_TIME used)
      const allVouchers = await fetchWalletVouchers(token);

      // Filter: ẩn đã sử dụng, hết hạn, quantity = 0
      const now = new Date();
      const filtered = allVouchers.filter((voucher) => {
        // Ẩn voucher đã sử dụng
        if (voucher.used) {
          return false;
        }

        // Ẩn voucher hết hạn
        if (new Date(voucher.expiryDate) < now) {
          return false;
        }

        // Note: Backend không trả về quantity, nhưng đã filter ONE_TIME used ở loyaltyService
        // Không cần filter lại ở đây

        return true;
      });

      setVouchers(filtered);
    } catch (error: any) {
      message.error("Lỗi khi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async (voucher: WalletVoucher) => {
    setIsApplying(true);
    try {
      // Tính discount amount
      const discountAmount = (cartTotal * voucher.percent) / 100;

      message.success(
        `Áp dụng voucher thành công! Tiết kiệm ${discountAmount.toLocaleString(
          "vi-VN"
        )}₫`
      );
      onApplyVoucher(voucher.discountCodeId, discountAmount);
      setIsDrawerOpen(false);
      setSelectedVoucher(null);

      // Reload danh sách voucher để ẩn voucher đã được dùng
      loadVouchers();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi áp dụng voucher");
    } finally {
      setIsApplying(false);
    }
  };

  const renderVoucherCard = (voucher: WalletVoucher) => {
    const isLocked = cartTotal < voucher.minPriceToApply;
    const isSelected = selectedVoucherId === voucher.discountCodeId;

    return (
      <Col xs={24} key={voucher.walletVoucherId}>
        <Card
          hoverable={!isLocked}
          style={{
            borderRadius: 8,
            border: isSelected ? "2px solid #C92127" : "1px solid #f0f0f0",
            opacity: isLocked ? 0.6 : 1,
            background: isSelected ? "#FFF5F5" : "white",
            cursor: isLocked ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (!isLocked) {
              setSelectedVoucher(voucher);
            }
          }}
        >
          <Row gutter={16} align="middle">
            <Col span={2} style={{ textAlign: "center" }}>
              <GiftOutlined style={{ fontSize: 24, color: "#C92127" }} />
            </Col>
            <Col span={14}>
              <div>
                <div
                  style={{ fontWeight: 600, color: "#333", marginBottom: 4 }}
                >
                  {voucher.name}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {voucher.description || "Giảm giá cho đơn hàng"}
                </div>
                {voucher.minPriceToApply > 0 && (
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    Đơn tối thiểu:{" "}
                    {voucher.minPriceToApply.toLocaleString("vi-VN")}₫
                  </div>
                )}
              </div>
            </Col>
            <Col span={4}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontWeight: 700, color: "#C92127", fontSize: 18 }}
                >
                  {voucher.percent}%
                </div>
                <div style={{ fontSize: 11, color: "#999" }}>OFF</div>
              </div>
            </Col>
            <Col span={4} style={{ textAlign: "right" }}>
              {isSelected ? (
                <Button
                  type="primary"
                  size="small"
                  style={{ background: "#C92127" }}
                >
                  ✓ Đã chọn
                </Button>
              ) : isLocked ? (
                <Button size="small" disabled>
                  Khóa
                </Button>
              ) : (
                <Button
                  size="small"
                  onClick={() => setSelectedVoucher(voucher)}
                >
                  Chọn
                </Button>
              )}
            </Col>
          </Row>

          {/* Lock status */}
          {isLocked && (
            <div
              style={{
                marginTop: 8,
                padding: "8px 12px",
                background: "#FFE6E6",
                borderRadius: 4,
                fontSize: 12,
                color: "#C92127",
              }}
            >
              🔒 {voucher.description || "Không đủ điều kiện để áp dụng"}
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <>
      <Button
        type="dashed"
        block
        onClick={() => setIsDrawerOpen(true)}
        style={{
          borderColor: "#C92127",
          color: "#C92127",
          fontWeight: 600,
          height: 40,
        }}
      >
        <GiftOutlined /> Chọn voucher ({vouchers.length})
      </Button>

      <Drawer
        title={
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            <GiftOutlined style={{ marginRight: 8 }} />
            Chọn voucher áp dụng
          </div>
        }
        placement="right"
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedVoucher(null);
        }}
        open={isDrawerOpen}
        width={500}
      >
        <Spin spinning={loading}>
          {vouchers.length > 0 ? (
            <div>
              <Row gutter={[0, 12]}>{vouchers.map(renderVoucherCard)}</Row>

              {selectedVoucher && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 16,
                    background: "#FFF5F5",
                    borderRadius: 8,
                    borderTop: "2px solid #C92127",
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      {selectedVoucher.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#666", marginBottom: 12 }}
                    >
                      {selectedVoucher.description}
                    </div>
                    {selectedVoucher.minPriceToApply > 0 && (
                      <div style={{ fontSize: 12, color: "#666" }}>
                        📦 Đơn tối thiểu:{" "}
                        {selectedVoucher.minPriceToApply.toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </div>
                    )}
                  </div>

                  <Button
                    type="primary"
                    danger
                    block
                    loading={isApplying}
                    onClick={() => handleApplyVoucher(selectedVoucher)}
                    style={{
                      background: "#C92127",
                      borderColor: "#C92127",
                      height: 40,
                      fontWeight: 600,
                    }}
                  >
                    Áp dụng voucher
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Empty
              description={
                loading ? "Đang tải..." : "Không có voucher khả dụng"
              }
              style={{ marginTop: 40 }}
            />
          )}
        </Spin>
      </Drawer>
    </>
  );
};

export default VoucherSelector;
