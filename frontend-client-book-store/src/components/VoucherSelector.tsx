import { GiftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  message,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import API from "../config/api";
// ❌ Bỏ service cũ vì đang normalize/filter sai
// import { fetchWalletVouchers } from "../services/loyaltyService";
import type { WalletVoucher } from "../types/Loyalty";

const { Text, Paragraph } = Typography;

// Derive API base safely without using 'any'
const API_BASE: string =
  (typeof API === "object" && (API as { API_BASE?: string }).API_BASE) ||
  (import.meta.env &&
    (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL) ||
  "http://DESKTOP-GL3I116:8080";

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
  onRemoveVoucher: () => void;
  selectedVoucherId?: string;
}

/** ✅ Parse used an toàn hơn (backend có thể trả boolean/number/string) */
const parseUsed = (v: unknown) => {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
  return Boolean(v);
};

/** ✅ Normalize theo đúng chuẩn VoucherPage */
const normalizeWalletVouchers = (data: unknown): WalletVoucher[] => {
  const arr = Array.isArray(data) ? data : [];

  return arr.map((m: Record<string, unknown>) => {
    return {
      walletVoucherId: String(m.walletVoucherId ?? m.discountCodeId ?? ""),
      discountCodeId: String(m.discountCodeId ?? ""),
      name: String(m.name ?? ""),
      percent: Number(m.percent ?? 0),
      minPriceToApply: Number(m.minPriceToApply ?? 0),
      description: String(m.description ?? ""),
      startDate: String(m.startDate ?? new Date().toISOString()),
      endDate: String(m.endDate ?? new Date().toISOString()),
      createdDate: new Date().toISOString(),

      used: parseUsed(m.used),
      remainingUses: Number(m.remainingUses ?? 0),

      isPublic: Boolean(m.isPublic ?? true),
      redeemable: Boolean(m.redeemable ?? false),

      discountType: (m.discountType === "ONE_TIME"
        ? "ONE_TIME"
        : "MANY_TIME") as "ONE_TIME" | "MANY_TIME",
      maxQuantityCanUse: Number(m.maxQuantityCanUse ?? 1),
    };
  }) as WalletVoucher[];
};

const VoucherSelector: React.FC<VoucherSelectorProps> = ({
  cartTotal,
  onApplyVoucher,
  onRemoveVoucher,
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

  // ✅ Không giữ token cố định ngoài scope để tránh stale
  const getToken = () => localStorage.getItem("access_token") || "";

  // Load available vouchers khi component mount hoặc cartTotal thay đổi
  useEffect(() => {
    if (cartTotal > 0 && getToken()) {
      loadVouchers();
    } else {
      setVouchers([]);
      setApplicableMap({});
      setReasonMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setVouchers([]);
        return;
      }

      // ✅ Lấy đúng endpoint giống VoucherPage
      const resp = await fetch(buildApiUrl(`/discounts/wallet`), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${t || "Không thể tải ví"}`);
      }

      const data = await resp.json();

      // ✅ Normalize theo chuẩn VoucherPage
      const normalized = normalizeWalletVouchers(data);

      // ✅ Filter giống "AVAILABLE" logic
      const now = new Date();
      const filtered = normalized.filter((voucher) => {
        const isExpired = new Date(voucher.endDate) < now;
        const isUsed = Boolean(voucher.used);
        const hasRemaining = voucher.remainingUses > 0;

        return !isUsed && !isExpired && hasRemaining;
      });

      setVouchers(filtered);

      // ✅ Validate applicability per voucher against backend
      const results: Record<string, boolean> = {};
      const reasons: Record<string, string> = {};

      await Promise.all(
        filtered.map(async (v) => {
          try {
            const checkResp = await fetch(
              buildApiUrl(
                `/discounts/wallet/${encodeURIComponent(
                  v.walletVoucherId
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

            if (checkResp.ok) {
              const dto = await checkResp.json();
              results[v.walletVoucherId] = !!dto.applicable;
              if (dto.reason) {
                reasons[v.walletVoucherId] = String(dto.reason);
              }
            } else {
              if (checkResp.status === 401) {
                results[v.walletVoucherId] = true;
                reasons[v.walletVoucherId] =
                  "Cần đăng nhập để kiểm tra điều kiện áp dụng";
              } else {
                results[v.walletVoucherId] = false;
                reasons[
                  v.walletVoucherId
                ] = `HTTP ${checkResp.status}: Không thể kiểm tra điều kiện áp dụng`;
              }
            }
          } catch {
            results[v.walletVoucherId] = false;
            reasons[v.walletVoucherId] = "Lỗi kết nối khi kiểm tra điều kiện";
          }
        })
      );

      setApplicableMap(results);
      setReasonMap(reasons);
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async (voucher: WalletVoucher) => {
    setIsApplying(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Vui lòng đăng nhập để áp dụng voucher");

      // Re-validate applicability before applying
      const resp = await fetch(
        buildApiUrl(
          `/discounts/wallet/${encodeURIComponent(
            voucher.walletVoucherId
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

      onApplyVoucher(voucher.walletVoucherId, discountAmount);
      setIsDrawerOpen(false);
      setSelectedVoucher(null);

      // ✅ Nếu bạn muốn sau khi áp dụng thì reload để ẩn ONE_TIME đã dùng
      // await loadVouchers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lỗi khi áp dụng voucher";
      message.error(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    onRemoveVoucher();
    message.info("Đã gỡ voucher khỏi đơn hàng");
  };

  const getAppliedVoucher = () => {
    return (
      vouchers.find((v) => v.walletVoucherId === selectedVoucherId) ||
      selectedVoucher
    );
  };

  // =================== UI GIỮ NGUYÊN ===================

  const renderVoucherCard = (voucher: WalletVoucher) => {
    const backendApplicable = applicableMap[voucher.walletVoucherId];
    const backendReason = reasonMap[voucher.walletVoucherId];
    const isLocked =
      cartTotal < voucher.minPriceToApply || backendApplicable === false;
    const isSelected = selectedVoucherId === voucher.walletVoucherId;
    const isCurrentlySelected =
      selectedVoucher?.walletVoucherId === voucher.walletVoucherId;

    const cardBorderColor = isSelected
      ? "#C92127"
      : isCurrentlySelected
      ? "#F59397"
      : "#f0f0f0";

    const cardBgColor = isSelected || isCurrentlySelected ? "#FFF5F5" : "white";

    return (
      <Col xs={24} key={voucher.walletVoucherId}>
        <Card
          hoverable={!isLocked}
          style={{
            borderRadius: 12,
            border: `2px solid ${cardBorderColor}`,
            opacity: isLocked ? 0.7 : 1,
            background: cardBgColor,
            cursor: isLocked ? "not-allowed" : "pointer",
            transition: "all 0.3s",
          }}
          bodyStyle={{ padding: 16 }}
          onClick={() => {
            if (!isLocked) {
              setSelectedVoucher(voucher);
            }
          }}
        >
          <Row gutter={16} align="middle">
            {/* Left side: Icon and Info */}
            <Col span={17}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <GiftOutlined
                  style={{
                    fontSize: 24,
                    color: isLocked ? "#999" : "#C92127",
                    marginRight: 12,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: isLocked ? "#999" : "#333",
                      marginBottom: 2,
                      fontSize: 16,
                    }}
                  >
                    {voucher.name}
                  </div>
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 1 }}
                    style={{ fontSize: 12, margin: 0 }}
                  >
                    {voucher.description || "Giảm giá cho đơn hàng"}
                  </Paragraph>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                    {voucher.minPriceToApply > 0 && (
                      <span>
                        Đơn tối thiểu:{" "}
                        <Text strong>
                          {voucher.minPriceToApply.toLocaleString("vi-VN")}₫
                        </Text>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Col>

            {/* Right side: Discount and Button */}
            <Col span={7} style={{ textAlign: "right" }}>
              <div style={{ marginBottom: 8 }}>
                <Text
                  style={{ fontWeight: 800, color: "#C92127", fontSize: 20 }}
                >
                  {voucher.percent}% OFF
                </Text>
              </div>

              {isSelected ? (
                <Tag color="error" style={{ fontWeight: 600 }}>
                  Đã áp dụng
                </Tag>
              ) : isLocked ? (
                <Button size="small" disabled style={{ opacity: 0.8 }}>
                  Khóa
                </Button>
              ) : (
                <Button
                  size="small"
                  type={isCurrentlySelected ? "primary" : "default"}
                  style={{
                    background: isCurrentlySelected ? "#C92127" : undefined,
                    borderColor: isCurrentlySelected ? "#C92127" : undefined,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVoucher(voucher);
                  }}
                >
                  {isCurrentlySelected ? "Đã chọn" : "Chọn"}
                </Button>
              )}
            </Col>
          </Row>

          {/* Lock status */}
          {isLocked && (
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "#FFE6E6",
                borderRadius: 8,
                fontSize: 12,
                color: "#C92127",
                borderLeft: "4px solid #C92127",
              }}
            >
              <Text strong type="danger">
                ⚠️ Không áp dụng được:
              </Text>{" "}
              {backendApplicable === false
                ? backendReason ||
                  "Voucher không đủ điều kiện áp dụng với tổng đơn hiện tại"
                : `Tổng đơn hàng phải đạt ${voucher.minPriceToApply.toLocaleString(
                    "vi-VN"
                  )}₫ trở lên.`}
            </div>
          )}
        </Card>
      </Col>
    );
  };

  const applied = getAppliedVoucher();

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
          height: 44,
          fontSize: 16,
          boxShadow: "0 2px 0 rgba(201, 33, 39, 0.05)",
        }}
      >
        <GiftOutlined />{" "}
        {selectedVoucherId
          ? "Thay đổi Voucher"
          : `Chọn Voucher (${vouchers.length})`}
      </Button>

      {/* Applied voucher summary shown under the select button */}
      {selectedVoucherId && applied ? (
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
              <GiftOutlined style={{ fontSize: 20, color: "#C92127" }} />
            </Col>
            <Col flex="auto">
              <div style={{ fontWeight: 700, color: "#C92127" }}>
                {applied.name}
              </div>
              <div style={{ fontSize: 13, color: "#333" }}>
                Giảm {applied.percent}% (Ước tính:{" "}
                <Text strong type="danger">
                  {((cartTotal * applied.percent) / 100).toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </Text>
                )
              </div>
            </Col>
            <Col flex="none">
              <Button
                size="small"
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleRemoveVoucher}
              >
                Gỡ
              </Button>
            </Col>
          </Row>
        </Card>
      ) : null}

      <Drawer
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#333" }}>
            <GiftOutlined style={{ marginRight: 8, color: "#C92127" }} />
            Kho Voucher của bạn
          </div>
        }
        placement="right"
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedVoucher(null);
        }}
        open={isDrawerOpen}
        width={500}
        styles={{
          body: { padding: "16px 24px" },
          footer: selectedVoucher
            ? { padding: "10px 24px", borderTop: "1px solid #f0f0f0" }
            : undefined,
        }}
        footer={
          selectedVoucher && (
            <Button
              type="primary"
              danger
              block
              loading={isApplying}
              onClick={() => handleApplyVoucher(selectedVoucher)}
              style={{
                background: "#C92127",
                borderColor: "#C92127",
                height: 48,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Áp dụng voucher "{selectedVoucher.name}"
            </Button>
          )
        }
      >
        <Spin spinning={loading}>
          {vouchers.length > 0 ? (
            <div style={{ marginBottom: selectedVoucher ? 0 : 20 }}>
              <Row gutter={[0, 16]}>{vouchers.map(renderVoucherCard)}</Row>
            </div>
          ) : (
            <Empty
              description={
                loading
                  ? "Đang tải..."
                  : "Không có voucher khả dụng nào trong ví của bạn."
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 40 }}
            />
          )}
        </Spin>
      </Drawer>
    </>
  );
};

export default VoucherSelector;
