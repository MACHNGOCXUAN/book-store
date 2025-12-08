import { GiftOutlined } from "@ant-design/icons";
import { Button, Card, Col, Drawer, Empty, message, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import API from "../config/api";
import { fetchWalletVouchers } from "../services/loyaltyService";
import type { WalletVoucher } from "../types/Loyalty";
// Derive API base safely without using 'any'
const API_BASE: string =
  (typeof API === "object" && (API as { API_BASE?: string }).API_BASE) ||
  (import.meta.env &&
    (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL) ||
  "http://localhost:8080";

// Build URL safely to avoid double /api in base
const buildApiUrl = (path: string) => {
  const base = API_BASE.replace(/\/$/, "");
  if (base.endsWith("/api")) {
    return `${base}${path}`;
  }
  return `${base}/api${path}`;
};

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
  const [applicableMap, setApplicableMap] = useState<Record<string, boolean>>(
    {}
  );
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Validate applicability per voucher against backend
      const results: Record<string, boolean> = {};
      const reasons: Record<string, string> = {};
      await Promise.all(
        filtered.map(async (v) => {
          try {
            const resp = await fetch(
              buildApiUrl(
                `/discounts/wallet/${encodeURIComponent(
                  v.discountCodeId
                )}?cartTotal=${encodeURIComponent(cartTotal)}`
              ),
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (resp.ok) {
              const dto = await resp.json();
              results[v.discountCodeId] = !!dto.applicable;
              if (dto.reason) {
                reasons[v.discountCodeId] = String(dto.reason);
              }
            } else {
              if (resp.status === 401) {
                // Không khóa voucher khi chưa xác thực, hiển thị lý do thân thiện
                results[v.discountCodeId] = true;
                reasons[v.discountCodeId] =
                  "Cần đăng nhập để kiểm tra điều kiện áp dụng";
              } else {
                results[v.discountCodeId] = false;
                reasons[
                  v.discountCodeId
                ] = `HTTP ${resp.status}: Không thể kiểm tra điều kiện áp dụng`;
              }
            }
          } catch {
            results[v.discountCodeId] = false;
            reasons[v.discountCodeId] = "Lỗi kết nối khi kiểm tra điều kiện";
          }
        })
      );
      setApplicableMap(results);
      setReasonMap(reasons);
    } catch {
      message.error("Lỗi khi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async (voucher: WalletVoucher) => {
    setIsApplying(true);
    try {
      // Re-validate applicability before applying
      const resp = await fetch(
        buildApiUrl(
          `/discounts/wallet/${encodeURIComponent(
            voucher.discountCodeId
          )}?cartTotal=${encodeURIComponent(cartTotal)}`
        ),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!resp.ok) {
        if (resp.status === 401) {
          throw new Error("Vui lòng đăng nhập để áp dụng voucher");
        }
        throw new Error(`Kiểm tra voucher thất bại (HTTP ${resp.status})`);
      }
      const dto = await resp.json();
      if (!dto.applicable) {
        throw new Error(
          "Voucher không đủ điều kiện áp dụng với tổng đơn hiện tại"
        );
      }

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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lỗi khi áp dụng voucher";
      message.error(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const renderVoucherCard = (voucher: WalletVoucher) => {
    const backendApplicable = applicableMap[voucher.discountCodeId];
    const backendReason = reasonMap[voucher.discountCodeId];
    const isLocked =
      cartTotal < voucher.minPriceToApply || backendApplicable === false;
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
              🔒{" "}
              {backendApplicable === false
                ? backendReason ||
                  "Voucher không đủ điều kiện áp dụng với tổng đơn hiện tại"
                : voucher.description || "Không đủ điều kiện để áp dụng"}
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

      {/* Applied voucher summary shown under the select button */}
      {selectedVoucherId &&
        (() => {
          const applied =
            vouchers.find((v) => v.discountCodeId === selectedVoucherId) ||
            selectedVoucher;
          if (!applied) return null;
          const estimatedDiscount = (cartTotal * applied.percent) / 100;
          return (
            <Card
              size="small"
              style={{
                marginTop: 12,
                borderRadius: 8,
                background: "#FFF5F5",
                border: "1px solid #F5C3C5",
              }}
            >
              <Row align="middle" gutter={12}>
                <Col flex="none">
                  <GiftOutlined style={{ fontSize: 18, color: "#C92127" }} />
                </Col>
                <Col flex="auto">
                  <div style={{ fontWeight: 600, color: "#333" }}>
                    {applied.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Đã áp dụng: Giảm {applied.percent}% (~
                    {estimatedDiscount.toLocaleString("vi-VN")}₫)
                  </div>
                </Col>
                <Col flex="none">
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    Thay đổi
                  </Button>
                </Col>
              </Row>
            </Card>
          );
        })()}

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
